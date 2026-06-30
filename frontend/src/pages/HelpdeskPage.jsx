import React, { useState, useEffect, useRef } from 'react';
import { 
  LifeBuoy, Plus, MessageSquare, Send, Clock, AlertTriangle, 
  CheckCircle, X, Shield, ArrowLeft, RefreshCw 
} from 'lucide-react';
import api from '../utils/api.js';
import { useSelector } from 'react-redux';

const HelpdeskPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Selected ticket detailed view
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  // New Ticket Modal State
  const [showNewModal, setShowNewModal] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [modalLoading, setModalLoading] = useState(false);

  const chatEndRef = useRef(null);

  const fetchTickets = async (autoSelectId = null) => {
    setLoading(true);
    try {
      const res = await api.get('/tickets');
      if (res.data.success) {
        const fetched = res.data.tickets || [];
        setTickets(fetched);
        
        // Handle auto-selection (e.g. after replying or creating)
        if (autoSelectId) {
          const updated = fetched.find(t => t._id === autoSelectId);
          if (updated) setSelectedTicket(updated);
        } else if (fetched.length > 0 && !selectedTicket) {
          setSelectedTicket(fetched[0]);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch support tickets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Auto-scroll chat to bottom when selectedTicket updates
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedTicket]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    setModalLoading(true);
    try {
      const res = await api.post('/tickets', {
        subject,
        description,
        priority,
      });

      if (res.data.success) {
        setSubject('');
        setDescription('');
        setPriority('medium');
        setShowNewModal(false);
        // Refresh and auto-select the newly created ticket
        await fetchTickets(res.data.ticket._id);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error raising support query');
    } finally {
      setModalLoading(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;

    setReplyLoading(true);
    try {
      const res = await api.post(`/tickets/${selectedTicket._id}/reply`, {
        message: replyMessage,
      });

      if (res.data.success) {
        setReplyMessage('');
        // Refresh ticket list and update detail view
        await fetchTickets(selectedTicket._id);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to send reply');
    } finally {
      setReplyLoading(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!selectedTicket || !window.confirm('Are you sure you want to mark this query as closed?')) return;

    try {
      const res = await api.put(`/tickets/${selectedTicket._id}/status`, {
        status: 'closed',
      });

      if (res.data.success) {
        await fetchTickets(selectedTicket._id);
      }
    } catch (err) {
      console.error(err);
      alert('Error closing ticket');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-clinic-50 text-clinic-600 dark:bg-clinic-950/20">Open</span>;
      case 'in-progress':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-50 text-indigo-650 dark:bg-indigo-950/20">In Progress</span>;
      case 'resolved':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-650 dark:bg-emerald-950/20">Resolved</span>;
      case 'closed':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-500 dark:bg-slate-800">Closed</span>;
      default:
        return null;
    }
  };

  const getPriorityBadge = (prio) => {
    switch (prio) {
      case 'high':
        return <span className="text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/20 px-1.5 py-0.5 rounded">High</span>;
      case 'medium':
        return <span className="text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/20 px-1.5 py-0.5 rounded">Medium</span>;
      case 'low':
        return <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">Low</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <LifeBuoy className="w-7 h-7 text-clinic-500" />
            Support Help Desk
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Submit queries, ask for help, or request customization directly from platform admins.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchTickets(selectedTicket?._id)}
            className="p-2.5 border border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl cursor-pointer text-slate-500 dark:text-slate-400"
            title="Refresh tickets"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2.5 bg-clinic-500 text-white font-extrabold text-xs rounded-xl hover:bg-clinic-600 transition-colors shadow-md shadow-clinic-500/10 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Raise New Query
          </button>
        </div>
      </div>

      {loading && tickets.length === 0 ? (
        <div className="flex items-center justify-center h-96">
          <div className="w-10 h-10 border-4 border-clinic-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="p-6 text-center text-rose-500 font-bold bg-white dark:bg-darkbg-100 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-sm">
          {error}
        </div>
      ) : tickets.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-darkbg-100 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-sm space-y-4">
          <LifeBuoy className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No support tickets found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">Have a doubt or running into issue? Raise your first support query and our admin team will reply soon.</p>
          <button
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2 bg-clinic-500 text-white text-xs font-bold rounded-xl hover:bg-clinic-600 cursor-pointer"
          >
            Create Ticket
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-210px)] min-h-[500px]">
          
          {/* Left panel: Ticket list */}
          <div className="lg:col-span-1 border border-slate-200 dark:border-slate-850 bg-white dark:bg-darkbg-100 rounded-3xl flex flex-col overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 dark:border-slate-850">
              <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ticket History</span>
            </div>
            
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-850">
              {tickets.map((t) => (
                <button
                  key={t._id}
                  onClick={() => setSelectedTicket(t)}
                  className={`w-full p-4 text-left flex flex-col gap-2 hover:bg-slate-55/30 transition-all cursor-pointer border-l-4 ${
                    selectedTicket?._id === t._id 
                      ? 'bg-slate-55/40 dark:bg-slate-900/30 border-clinic-500' 
                      : 'border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-slate-400">{t.ticketId}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(t.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-1">{t.subject}</p>
                  
                  <div className="flex items-center justify-between mt-1">
                    {getPriorityBadge(t.priority)}
                    {getStatusBadge(t.status)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right panel: Active ticket details and replies chat thread */}
          <div className="lg:col-span-2 border border-slate-200 dark:border-slate-850 bg-white dark:bg-darkbg-100 rounded-3xl flex flex-col overflow-hidden shadow-sm">
            {selectedTicket ? (
              <>
                {/* Details Header */}
                <div className="p-5 border-b border-slate-100 dark:border-slate-850 bg-slate-55/20 dark:bg-slate-900/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-400">{selectedTicket.ticketId}</span>
                      {getPriorityBadge(selectedTicket.priority)}
                      {getStatusBadge(selectedTicket.status)}
                    </div>
                    <h2 className="text-sm font-black text-slate-800 dark:text-slate-100">{selectedTicket.subject}</h2>
                  </div>
                  
                  {selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' && (
                    <button
                      onClick={handleCloseTicket}
                      className="px-3 py-1.5 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer"
                    >
                      Close Query
                    </button>
                  )}
                </div>

                {/* Conversation Thread */}
                <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/20 dark:bg-slate-900/5">
                  
                  {/* Original Query description */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-clinic-100 dark:bg-clinic-950/30 text-clinic-600 dark:text-clinic-400 flex items-center justify-center font-bold text-xs shrink-0 uppercase">
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex-1 bg-white dark:bg-darkbg-200 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl shadow-sm">
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">You (Owner)</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(selectedTicket.createdAt).toLocaleDateString()} {new Date(selectedTicket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-655 dark:text-slate-300 whitespace-pre-line leading-relaxed">{selectedTicket.description}</p>
                    </div>
                  </div>

                  {/* Responses */}
                  {selectedTicket.responses && selectedTicket.responses.map((reply, index) => {
                    const isAdmin = reply.senderId !== user._id;
                    return (
                      <div key={reply._id || index} className={`flex gap-3 ${isAdmin ? 'flex-row' : 'flex-row'}`}>
                        {isAdmin ? (
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400 flex items-center justify-center shrink-0">
                            <Shield className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-clinic-100 dark:bg-clinic-950/30 text-clinic-600 dark:text-clinic-400 flex items-center justify-center font-bold text-xs shrink-0 uppercase">
                            {reply.senderName.charAt(0)}
                          </div>
                        )}
                        
                        <div className={`flex-1 p-4 rounded-2xl shadow-sm border ${
                          isAdmin 
                            ? 'bg-indigo-50/20 dark:bg-indigo-950/10 border-indigo-100 dark:border-indigo-950' 
                            : 'bg-white dark:bg-darkbg-200 border-slate-100 dark:border-slate-850'
                        }`}>
                          <div className="flex items-center justify-between gap-4 mb-2">
                            <span className={`text-xs font-bold ${isAdmin ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'}`}>
                              {isAdmin ? `Super Admin (${reply.senderName})` : 'You'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(reply.createdAt).toLocaleDateString()} {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-650 dark:text-slate-300 whitespace-pre-line leading-relaxed">{reply.message}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>

                {/* Reply Form */}
                {selectedTicket.status !== 'closed' ? (
                  <form onSubmit={handleSendReply} className="p-4 border-t border-slate-100 dark:border-slate-850 bg-white dark:bg-darkbg-100 flex gap-3">
                    <textarea
                      rows={2}
                      required
                      placeholder="Type your message reply here..."
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 focus:border-transparent outline-none transition-all dark:text-white text-xs resize-none"
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={replyLoading || !replyMessage.trim()}
                      className="px-5 bg-clinic-500 hover:bg-clinic-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-clinic-500/10 hover:shadow-clinic-500/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <div className="p-4 border-t border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/30 text-center text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    🔒 This ticket is closed. If you still have queries, please raise a new ticket.
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-2">
                <MessageSquare className="w-10 h-10 text-slate-300" />
                <p className="text-xs">Select a ticket from history to view conversation thread</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Ticket Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white dark:bg-darkbg-100 rounded-3xl border border-slate-200 dark:border-slate-855 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowNewModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-black text-slate-805 dark:text-slate-100 mb-2 flex items-center gap-2">
              <LifeBuoy className="w-5 h-5 text-clinic-500" />
              Raise Support Query
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Describe your query or issue and the Eyelitz admin team will assist you shortly.</p>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider mb-1.5">Query Subject</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 dark:text-white"
                  placeholder="e.g., Billing Issue, Feature Request, Custom Print Layout"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider mb-1.5">Query Priority</label>
                <select
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-250 dark:text-white"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="low">Low - General query, feedback or suggestion</option>
                  <option value="medium">Medium - Operational doubt, feature settings query</option>
                  <option value="high">High - System blocking issue, subscription checkout failure</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider mb-1.5">Detailed Description</label>
                <textarea
                  rows={5}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 dark:text-white text-xs resize-none"
                  placeholder="Provide all context, details and steps. This helps our admin solve your issue faster."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-450 font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2.5 bg-clinic-500 hover:bg-clinic-600 text-white font-extrabold rounded-xl shadow-lg shadow-clinic-500/10 transition-colors cursor-pointer"
                >
                  {modalLoading ? 'Submitting query...' : 'Raise Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpdeskPage;
