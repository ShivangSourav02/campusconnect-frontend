import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Quotation } from '../../types';

export default function ViewQuotations() {
  const { rfqId } = useParams();
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<number | null>(null);

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      const res = await api.get(`/quotation/rfq/${rfqId}`);
      setQuotations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (quotationId: number) => {
    setAccepting(quotationId);
    try {
      await api.patch(`/quotation/${quotationId}/accept`);
      fetchQuotations();
    } catch (err) {
      console.error(err);
    } finally {
      setAccepting(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-800 text-white px-6 py-4 flex justify-between items-center shadow">
        <h1 className="text-xl font-bold">🎓 CampusConnect — Quotations</h1>
        <button onClick={() => navigate('/school/dashboard')} className="text-blue-200 hover:text-white text-sm">
          ← Back to Dashboard
        </button>
      </nav>

      <div className="max-w-5xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Quotations Received</h2>
        <p className="text-gray-500 text-sm mb-6">Compare and accept the best quotation</p>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : quotations.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow">
            <p className="text-gray-400 text-lg">No quotations received yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {quotations.map((q) => (
              <div key={q.id} className={`bg-white rounded-xl shadow p-6 border-l-4 ${
                q.status === 'ACCEPTED' ? 'border-green-500' :
                q.status === 'REJECTED' ? 'border-red-400' : 'border-blue-500'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{q.companyName}</h3>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-3 text-sm text-gray-600">
                      <span>💰 Total Price: <strong>₹{q.totalPrice?.toLocaleString()}</strong></span>
                      <span>🚚 Delivery: <strong>{q.deliveryDays} days</strong></span>
                      <span>🧵 Sample: <strong>{q.sampleAvailable}</strong></span>
                      <span>📋 Terms: <strong>{q.termsAndConditions}</strong></span>
                    </div>
                    {q.additionalNotes && (
                      <p className="text-gray-500 text-sm mt-2">📝 {q.additionalNotes}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      q.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                      q.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'}`}>
                      {q.status}
                    </span>
                    {q.status === 'SUBMITTED' && (
                      <button
                        onClick={() => handleAccept(q.id)}
                        disabled={accepting === q.id}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50">
                        {accepting === q.id ? 'Accepting...' : '✓ Accept'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}