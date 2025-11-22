import React, { useState } from 'react';
import { verifyUserHandle } from '../services/cfService';
import { useAuth } from '../context/AuthContext';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const Onboarding = () => {
  const { updatePrefs } = useAuth();
  const [handle, setHandle] = useState('');
  const [status, setStatus] = useState('idle'); // idle, verifying, success, error
  const [errorMsg, setErrorMsg] = useState('');
  const [verifiedUser, setVerifiedUser] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('verifying');
    setErrorMsg('');

    const cfUser = await verifyUserHandle(handle);

    if (cfUser) {
      setVerifiedUser(cfUser);
      setStatus('success');
      
      // Wait 1.5s so user sees "Success", then close
      setTimeout(async () => {
        await updatePrefs({
            user: { cf_handle: cfUser.handle }
        });
      }, 1500);

    } else {
      setStatus('error');
      setErrorMsg('Handle not found on Codeforces.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700 max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-2">Welcome to AlgoRadar</h2>
        <p className="text-gray-400 mb-6">Enter your Codeforces handle to begin tracking.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">Codeforces Handle</label>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="e.g. tourist"
              disabled={status === 'success'}
            />
          </div>

          {status === 'error' && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-3 rounded-lg">
              <AlertCircle size={16} />
              {errorMsg}
            </div>
          )}

          {status === 'success' && (
             <div className="flex items-center gap-2 text-green-400 text-sm bg-green-400/10 p-3 rounded-lg">
               <CheckCircle size={16} />
               Found {verifiedUser.rank}: <b>{verifiedUser.handle}</b>
             </div>
          )}

          <button
            type="submit"
            disabled={status === 'verifying' || status === 'success' || !handle}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {status === 'verifying' ? <Loader2 className="animate-spin" /> : 'Connect Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
