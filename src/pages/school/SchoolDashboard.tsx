import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import api from '../../api/axios';
import { RFQ } from '../../types';

export default function SchoolDashboard() {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    uniformType: '',
    quantity: '',
    sizes: '',
    budget: '',
    deadline: '',
    deliveryAddress: '',
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const isVerified = user?.verified;

  useEffect(() => {
    fetchRFQs();
  }, []);

  const fetchRFQs = async () => {
    try {
      const res = await api.get('/rfq/my');
      setRfqs(res.data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/rfq', {
        ...form,
        quantity: parseInt(form.quantity),
        budget: parseFloat(form.budget),
      });
      setShowForm(false);
      setForm({ title: '', description: '', uniformType: '', quantity: '', sizes: '', budget: '', deadline: '', deliveryAddress: '' });
      fetchRFQs();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create RFQ. Make sure you have created a school profile first.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-blue-800 text-white px-6 py-4 flex justify-between items-center shadow">
        <h1 className="text-xl font-bold">🎓 CampusConnect — School Portal</h1>
        <div className="flex gap-4">
          <button onClick={() => navigate('/school/profile')} className="text-blue-200 hover:text-white text-sm">Profile</button>
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
              <p className="text-sm">Please complete your profile and wait for admin verification before posting RFQs.</p>
            </div>
            <button onClick={() => navigate('/school/profile')}
              className="ml-auto bg-yellow-500 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-yellow-600">
              Go to Profile
            </button>
          </div>
        )}

        {isVerified && (
          <div className="bg-green-50 border border-green-300 text-green-800 px-5 py-4 rounded-xl mb-6 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <p className="font-bold">Your account is verified. You can post RFQs!</p>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">My RFQs</h2>
            <p className="text-gray-500 text-sm">Manage your uniform procurement requests</p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setError(''); }}
            className="bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-800 transition"
          >
            + New RFQ
          </button>
        </div>

        {/* RFQ Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Create New RFQ</h3>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Uniform Type</label>
                <input type="text" value={form.uniformType} onChange={(e) => setForm({ ...form, uniformType: e.target.value })}
                  placeholder="e.g. Shirt, Trouser" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sizes</label>
                <input type="text" value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                  placeholder="e.g. S,M,L,XL" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget (₹)</label>
                <input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                <input type="text" value={form.deliveryAddress} onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="col-span-2 flex gap-3">
                <button type="submit" disabled={submitting}
                  className="bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-800 disabled:opacity-50">
                  {submitting ? 'Submitting...' : 'Submit RFQ'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setError(''); }}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* RFQ List */}
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : rfqs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow">
            <p className="text-gray-400 text-lg">No RFQs yet. Create your first one!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {rfqs.map((rfq) => (
              <div key={rfq.id} className="bg-white rounded-xl shadow p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{rfq.title}</h3>
                    <p className="text-gray-500 text-sm mt-1">{rfq.description}</p>
                    <div className="flex gap-4 mt-3 text-sm text-gray-600">
                      <span>📦 {rfq.uniformType}</span>
                      <span>🔢 Qty: {rfq.quantity}</span>
                      <span>💰 ₹{rfq.budget?.toLocaleString()}</span>
                      <span>📅 {rfq.deadline}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      rfq.status === 'OPEN' ? 'bg-green-100 text-green-700' :
                      rfq.status === 'AWARDED' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'}`}>
                      {rfq.status}
                    </span>
                    <button
                      onClick={() => navigate(`/school/rfq/${rfq.id}/quotations`)}
                      className="text-blue-600 text-sm hover:underline font-medium">
                      View Quotations →
                    </button>
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