import { useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { User, Calendar, Tag, GripVertical, Loader2 } from "lucide-react";

const STATUS_CONFIG = {
  open: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", label: "Open" },
  in_progress: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", label: "In Progress" },
  on_hold: { color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30", label: "On Hold" },
  closed: { color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/30", label: "Closed" },
};

const STATUSES = ["open", "in_progress", "on_hold", "closed"];

function TicketCard({ ticket, index, isDragging, onSelect }) {
  return (
    <Draggable draggableId={ticket.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`p-3 rounded-lg border transition-all ${
            snapshot.isDragging ? "shadow-lg ring-2 ring-primary" : "border-border/50 hover:border-border/80"
          } bg-card`}
        >
          <div className="flex gap-2 items-start">
            <div {...provided.dragHandleProps} className="text-muted-foreground mt-0.5">
              <GripVertical className="w-4 h-4" />
            </div>
            <button
              onClick={() => onSelect(ticket)}
              className="flex-1 text-left hover:text-primary transition-colors"
            >
              <h4 className="font-semibold text-sm leading-tight mb-1.5">{ticket.title}</h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {ticket.client_email}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(ticket.created_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </span>
                {ticket.category && (
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {ticket.category}
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center gap-1">
                {ticket.priority && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    ticket.priority === "high" ? "bg-red-500/15 text-red-400" :
                    ticket.priority === "medium" ? "bg-amber-500/15 text-amber-400" :
                    "bg-emerald-500/15 text-emerald-400"
                  }`}>
                    {ticket.priority}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>
      )}
    </Draggable>
  );
}

function KanbanColumn({ status, tickets, onSelect }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <div className="flex flex-col gap-3 flex-1 min-w-[300px]">
      <div className={`px-4 py-2.5 rounded-lg ${cfg.bg} border ${cfg.border}`}>
        <h3 className={`font-semibold text-sm ${cfg.color}`}>
          {cfg.label} ({tickets.length})
        </h3>
      </div>
      <Droppable droppableId={status} type="TICKET">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 rounded-lg p-3 min-h-[400px] transition-colors ${
              snapshot.isDraggingOver ? "bg-primary/5 border border-primary/20" : "bg-card/30 border border-border/20"
            }`}
          >
            <div className="flex flex-col gap-2.5">
              {tickets.map((ticket, index) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  index={index}
                  isDragging={false}
                  onSelect={onSelect}
                />
              ))}
            </div>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

export default function TicketKanban({ tickets, onSelect, onStatusUpdate }) {
  const [updating, setUpdating] = useState(null);

  const handleDragEnd = useCallback(async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const ticket = tickets.find(t => t.id === draggableId);
    if (!ticket) return;

    const newStatus = destination.droppableId;
    if (ticket.status === newStatus) return;

    setUpdating(draggableId);
    try {
      await base44.entities.SupportTicket.update(draggableId, { status: newStatus });
      onStatusUpdate();
    } finally {
      setUpdating(null);
    }
  }, [tickets, onStatusUpdate]);

  const grouped = STATUSES.reduce((acc, status) => {
    acc[status] = tickets.filter(t => t.status === status);
    return acc;
  }, {});

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUSES.map(status => (
          <KanbanColumn
            key={status}
            status={status}
            tickets={grouped[status]}
            onSelect={onSelect}
          />
        ))}
      </div>
      {updating && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-40">
          <div className="bg-card rounded-lg p-4 flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm font-medium">Updating ticket status...</span>
          </div>
        </div>
      )}
    </DragDropContext>
  );
}