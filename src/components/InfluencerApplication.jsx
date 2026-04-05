import React, { useState } from 'react';

const InfluencerApplication = ({ onClose, onSimulateVerify }) => {
  const [step, setStep] = useState(1); // 1 = Form, 2 = Success
  const [fileName, setFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fileName) {
      alert("Please upload a screenshot of your profile.");
      return;
    }
    
    // Simulate sending an email
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(2);
    }, 1500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{maxWidth: '500px'}}>
        <div className="modal-handle d-md-none"></div>
        
        <div className="modal-header">
          <h2 className="section-title">Influencer Application</h2>
          <div className="modal-close" onClick={onClose}>✕</div>
        </div>

        {step === 1 ? (
          <form className="flex-col gap-16" onSubmit={handleSubmit}>
            <p className="text-secondary" style={{fontSize: '13px', marginBottom: '8px'}}>
              Join our exclusive creator network. Earn commissions, manage your own deals, and access the Influencer Dashboard.
            </p>

            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input type="text" className="input" placeholder="e.g. Ayesha Malik" required />
            </div>

            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input type="email" className="input" placeholder="ayesha@example.com" required />
            </div>

            <div className="input-group">
              <label className="input-label">Primary Social Platform</label>
              <select className="input" required>
                <option value="">Select Platform</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube</option>
              </select>
            </div>
            
            <div className="input-group">
              <label className="input-label">Follower Count Check</label>
              <div className="flex items-center gap-10">
                <input type="checkbox" required id="followers-check" />
                <label className="text-secondary" style={{fontSize: '13px'}} htmlFor="followers-check">
                  I confirm I have more than 5,000 active followers
                </label>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Upload Profile Screenshot</label>
              
              <label className="input flex items-center justify-center border-dashed" style={{border: '2px dashed var(--border-strong)', padding: '30px', cursor: 'pointer', background: 'var(--bg-overlay)'}}>
                 <input type="file" accept="image/*" style={{display: 'none'}} onChange={handleFileChange} />
                 <div className="text-center">
                    <div style={{fontSize: '24px', marginBottom: '8px'}}>📸</div>
                    {fileName ? (
                      <div className="text-success font-bold" style={{fontSize: '13px'}}>{fileName} selected</div>
                    ) : (
                      <>
                        <div className="text-primary font-bold" style={{fontSize: '13px'}}>Click to upload screenshot</div>
                        <div className="text-muted" style={{fontSize: '11px', marginTop: '4px'}}>Verify your followers and engagement</div>
                      </>
                    )}
                 </div>
              </label>
            </div>

            <button type="submit" className="btn btn-primary btn-full mt-12 btn-lg" disabled={isSubmitting}>
              {isSubmitting ? "Sending Verification Email..." : "Submit Application"}
            </button>
          </form>
        ) : (
          <div className="text-center p-24">
            <div className="avatar avatar-xl mb-16" style={{background: 'rgba(16,185,129,0.1)', color: 'var(--success)', margin: '0 auto'}}>✅</div>
            <h2 className="page-title mb-8" style={{fontSize: '22px'}}>Application Received!</h2>
            
            <p className="text-secondary mb-24" style={{fontSize: '14px', lineHeight: '1.6'}}>
              Your application is under review. Please check your email for the verification link to complete your Influencer account setup.
            </p>
            
            <div className="divider"></div>
            
            <button className="btn btn-primary btn-full" onClick={onClose}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfluencerApplication;
