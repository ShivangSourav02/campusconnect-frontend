import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import api from '../../api/axios';
import { RFQ, Quotation } from '../../types';

export default function VendorDashboard() {
  const [openRFQs, setOpenRFQs] = useState<RFQ[]>([]);
  const [myQuotations, setMyQuotations] = useState<Quotation[]>([]);
  const [activeTab, setActiveTab] = useState<'rfqs' | 'quotations'>('rfqs');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedRFQ, setSelectedRFQ] = useState<RFQ | null>(null);
  const [form, setForm] = useState({
    totalPrice: '',
    deliveryDays: '',
    sampleAvailable: 'Yes',
    additionalNotes: '',
    termsAndConditions: '',
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const isVerified = user?.verified;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const rfqRes = await api.get('/rfq/open');
      setOpenRFQs(rfqRes.data);
    } catch (err) {
      console.error('Failed to fetch RFQs', err);
    }

    try {
      const quotationRes = await api.get('/quotation/my');
      setMyQuotations(quotationRes.data);
    } catch (err) {
      console.error('Failed to fetch quotations', err);
    }

    setLoading(false);
  };

  const handleSubmitQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRFQ) return;
    try {
      await api.post(`/quotation/rfq/${selectedRFQ.id}`, {
        ...form,
        totalPrice: parseFloat(form.totalPrice),
        deliveryDays: parseInt(form.deliveryDays),
      });
      setShowForm(false);
      setSelectedRFQ(null);
      setForm({ totalPrice: '', deliveryDays: '', sampleAvailable: 'Yes', additionalNotes: '', termsAndConditions: '' });
      fetchData();
      setActiveTab('quotations');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit quotation');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-indigo-800 text-white px-6 py-4 flex justify-between items-center shadow">
        <h1 className="text-xl font-bold">🏭 CampusConnect — Vendor Portal</h1>
        <div className="flex gap-4">
          <button onClick={() => navigate('/vendor/profile')} className="text-indigo-200 hover:text-white text-sm">Profile</button>
          <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-4 py-1 rounded text-sm font-medium">Logout</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6">

        {/* Verification Banner */}
        {!isVerified && (
          <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-5 py-4 rounded-xl mb-6 flex items-center gap-3">
            <span className="text-2xl">⏳</span>
            <div>
              <p className="font-bold">Your account is pending approval</p>
              <p className="text-sm">Please complete your profile and wait for admin verification before submitting quotations.</p>
            </div>
            <button onClick={() => navigate('/vendor/profile')}
              className="ml-auto bg-yellow-500 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-yellow-600">
              Go to Profile
            </button>
          </div>
        )}

        {isVerified && (
          <div className="bg-green-50 border border-green-300 text-green-800 px-5 py-4 rounded-xl mb-6 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <p className="font-bold">Your account is verified. You can submit quotations!</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('rfqs')}
            className={`px-5 py-2 rounded-lg font-semibold transition ${activeTab === 'rfqs' ? 'bg-indigo-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
            Open RFQs ({openRFQs.length})
          </button>
          <button
            onClick={() => setActiveTab('quotations')}
            className={`px-5 py-2 rounded-lg font-semibold transition ${activeTab === 'quotations' ? 'bg-indigo-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
            My Quotations ({myQuotations.length})
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : activeTab === 'rfqs' ? (
          <div className="grid gap-4">
            {openRFQs.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow">
                <p className="text-gray-400 text-lg">No open RFQs at the moment.</p>
              </div>
            ) : openRFQs.map((rfq) => (
              <div key={rfq.id} className="bg-white rounded-xl shadow p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{rfq.title}</h3>
                    <p className="text-gray-500 text-sm mt-1">{rfq.description}</p>
                    <div className="flex gap-4 mt-3 text-sm text-gray-600">
                      <span>🏫 {rfq.schoolName}</span>
                      <span>📍 {rfq.schoolCity}</span>
                      <span>📦 {rfq.uniformType}</span>
                      <span>🔢 Qty: {rfq.quantity}</span>
                      <span>💰 Budget: ₹{rfq.budget?.toLocaleString()}</span>
                      <span>📅 Deadline: {rfq.deadline}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => { setSelectedRFQ(rfq); setShowForm(true); }}
                    className="bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-800">
                    Submit Quote
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4">
            {myQuotations.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow">
                <p className="text-gray-400 text-lg">No quotations submitted yet.</p>
              </div>
            ) : myQuotations.map((q) => (
              <div key={q.id} className={`bg-white rounded-xl shadow p-6 border-l-4 ${
                q.status === 'ACCEPTED' ? 'border-green-500' :
                q.status === 'REJECTED' ? 'border-red-400' : 'border-indigo-500'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{q.rfqTitle}</h3>
                    <p className="text-gray-500 text-sm">🏫 {q.schoolName}</p>
                    <div className="flex gap-4 mt-3 text-sm text-gray-600">
                      <span>💰 ₹{q.totalPrice?.toLocaleString()}</span>
                      <span>🚚 {q.deliveryDays} days</span>
                      <span>🧵 Sample: {q.sampleAvailable}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    q.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                    q.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                    'bg-indigo-100 text-indigo-700'}`}>
                    {q.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Quotation Modal */}
      {showForm && selectedRFQ && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-1">Submit Quotation</h3>
            <p className="text-gray-500 text-sm mb-4">For: {selectedRFQ.title}</p>
            <form onSubmit={handleSubmitQuotation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Price (₹)</label>
                <input type="number" value={form.totalPrice} onChange={(e) => setForm({ ...form, totalPrice: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Days</label>
                <input type="number" value={form.deliveryDays} onChange={(e) => setForm({ ...form, deliveryDays: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sample Available</label>
                <select value={form.sampleAvailable} onChange={(e) => setForm({ ...form, sampleAvailable: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
                <input type="text" value={form.termsAndConditions} onChange={(e) => setForm({ ...form, termsAndConditions: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                <textarea value={form.additionalNotes} onChange={(e) => setForm({ ...form, additionalNotes: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" rows={2} />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-indigo-700 text-white py-2 rounded-lg font-semibold hover:bg-indigo-800">Submit</button>
                <button type="button" onClick={() => { setShowForm(false); setSelectedRFQ(null); }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}