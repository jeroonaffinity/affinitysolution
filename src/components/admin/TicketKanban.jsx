import { useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { User, Calendar, Tag, GripVertical, Loader2, UserCheck } from "lucide-react";
import { TICKET_STATUSES, PRIORITY_CONFIG } from "@/lib/slaConfig";
import SlaTimer from "@/components/admin/SlaTimer";

// Columns shown in the Kanban view
const KANBAN_STATUSES = ["new", "acknowledged", "in_progress", "waiting_on_client", "escalated", "resolved"];

function TicketCard({ ticket, index, onSelect }) {
  const priorityCfg = PRIORITY_CONFIG[ticket.priority] || {};
  return (
    <Draggable draggableId={ticket.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`p-3 rounded-lg border transition-all ${
            snapshot.isDragging ? "shadow-xl ring-2 ring-primary scale-[1.02]" : "border-border/50 hover:border-border/80"
          } bg-card`}
        >
          <div className="flex gap-2 items-start">
            <div {...provided.dragHandleProps} className="text-muted-foreground mt-0.5 shrink-0">
              <GripVertical className="w-3.5 h-3.5" />
            </div>
            <button onClick={() => onSelect(ticket)} className="flex-1 text-left min-w-0">
              <h4 className="font-semibold text-sm leading-tight mb-1.5 line-clamp-2">{ticket.title}</h4>
              <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 truncate">
                  <User className="w-3 h-3 shrink-0" />
                  <span className="truncate">{ticket.client_email}</span>
                </span>
                {ticket.assigned_to_name && (
                  <span className="flex items-center gap-1 truncate text-primary/70">
                    <UserCheck className="w-3 h-3 shrink-0" />
                    <span className="truncate">{ticket.assigned_to_name}</span>
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 shrink-0" />
                  {new Date(ticket.created_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-1 flex-wrap">
                {ticket.priority && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${priorityCfg.bg} ${priorityCfg.color}`}>
                    {priorityCfg.label}
                  </span>
                )}
                {ticket.category && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
                    {ticket.category}
                  </span>
                )}
              </div>
              {/* SLA compact timer */}
              <div className="mt-1.5">
                <SlaTimer ticket={ticket} compact />
              </div>
            </button>
          </div>
        </div>
      )}
    </Draggable>
  );
}

function KanbanColumn({ status, tickets, onSelect }) {
  const cfg = TICKET_STATUSES[status] || { label: status, color: "text-muted-foreground", bg: "bg-muted/20", border: "border-border/30" };
  const criticalCount = tickets.filter(t => t.priority === "critical").length;

  return (
    <div className="flex flex-col gap-2 flex-1 min-w-[260px] max-w-[320px]">
      <div className={`px-3 py-2 rounded-lg ${cfg.bg} border border-white/5`}>
        <div className="flex items-center justify-between">
          <h3 className={`font-semibold text-xs ${cfg.color}`}>{cfg.label}</h3>
          <div className="flex items-center gap-1">
            {criticalCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400">{criticalCount} crit</span>
            )}
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-muted-foreground">{tickets.length}</span>
          </div>
        </div>
      </div>
      <Droppable droppableId={status} type="TICKET">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 rounded-lg p-2 min-h-[400px] transition-colors ${
              snapshot.isDraggingOver ? "bg-primary/5 border border-primary/30" : "bg-card/30 border border-border/20"
            }`}
          >
            <div className="flex flex-col gap-2">
              {tickets.map((ticket, index) => (
                <TicketCard key={ticket.id} ticket={ticket} index={index} onSelect={onSelect} />
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
    await base44.entities.SupportTicket.update(draggableId, { status: newStatus });
    setUpdating(null);
    onStatusUpdate();
  }, [tickets, onStatusUpdate]);

  const grouped = KANBAN_STATUSES.reduce((acc, status) => {
    acc[status] = tickets.filter(t => t.status === status);
    return acc;
  }, {});

  // Unplaced tickets (statuses not in kanban view)
  const otherStatuses = Object.keys(TICKET_STATUSES).filter(s => !KANBAN_STATUSES.includes(s));
  otherStatuses.forEach(s => { grouped[s] = tickets.filter(t => t.status === s); });
  const otherTickets = otherStatuses.flatMap(s => grouped[s]);

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-4">
          {KANBAN_STATUSES.map(status => (
            <KanbanColumn key={status} status={status} tickets={grouped[status]} onSelect={onSelect} />
          ))}
        </div>
      </DragDropContext>

      {/* Other status tickets (on_hold, waiting_on_vendor, pending_approval, closed) */}
      {otherTickets.length > 0 && (
        <div className="mt-4">
          <div className="text-xs text-muted-foreground font-semibold mb-2 px-1">Other statuses</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
            {otherTickets.map(ticket => {
              const scfg = TICKET_STATUSES[ticket.status] || {};
              const pcfg = PRIORITY_CONFIG[ticket.priority] || {};
              return (
                <button key={ticket.id} onClick={() => onSelect(ticket)}
                  className="text-left p-3 rounded-lg border border-border/40 bg-card hover:border-border/80 transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium line-clamp-1">{ticket.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold shrink-0 ${scfg.bg} ${scfg.color}`}>
                      {scfg.label}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 truncate">{ticket.client_email}</div>
                  <div className="flex items-center gap-1 mt-1.5">
                    {ticket.priority && <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${pcfg.bg} ${pcfg.color}`}>{pcfg.label}</span>}
                    <SlaTimer ticket={ticket} compact />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {updating && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-40 pointer-events-none">
          <div className="bg-card rounded-lg p-4 flex items-center gap-3 shadow-xl">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm font-medium">Updating ticket...</span>
          </div>
        </div>
      )}
    </>
  );
}