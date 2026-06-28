import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Header } from '../components/Header';
import { api } from '../api/client';
import { TelegramUser } from '../App';

interface VerificationProps {
  onClose: () => void;
  onClaim: () => void;
  refreshUser: () => Promise<void>;
  user: TelegramUser | null;
}

export const Verification: React.FC<VerificationProps> = ({ onClose, onClaim, refreshUser, user }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClaim = async () => {
    try {
      setLoading(true);
      setError(null);
      await api.verifyTask();
      await refreshUser();
      onClaim();
    } catch (err: any) {
      setError(err.message || 'Verification failed. Did you join?');
    } finally {
      setLoading(false);
    }
  };
  const taskStyle = (bg: string, border: string) => ({
    background: bg,
    border: `1px solid ${border}`,
    borderRadius: '16px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '16px',
  });

  const joinedButtonStyle = {
    background: 'rgba(243, 156, 18, 0.9)',
    color: '#000',
    padding: '6px 12px',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  };

  return (
    <div style={{ paddingBottom: '100px', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header onClose={onClose} />
      
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
        <div style={{ background: 'rgba(46, 204, 113, 0.1)', color: 'var(--accent-green)', padding: '8px 24px', borderRadius: '24px', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(46, 204, 113, 0.3)' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--accent-green)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>✓</div>
          Verified. Your bonus is unlocked.
        </div>
      </div>

      <div style={{ padding: '0 20px', flex: 1, marginTop: '24px' }}>
        <Card variant="solid" padding="lg" style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '32px' }}>
            <div style={{ background: '#fff', borderRadius: '8px', padding: '4px' }}>
              <span style={{ color: '#000', fontWeight: 'bold', fontSize: '12px' }}>Algo</span>
            </div>
            <span style={{ fontSize: '20px', fontWeight: 800 }}>ALGOMIND</span>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#f39c12', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', borderBottom: '1px solid rgba(243, 156, 18, 0.3)', paddingBottom: '4px' }}>
              🔒 Final step to get in
            </div>
            <h2 style={{ fontSize: '24px', lineHeight: 1.3 }}>
              Join <span style={{ color: 'var(--accent-blue)' }}>AlgoMind</span>, the AI that trades the highest-edge algorithm for you
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Task 1 */}
            <div style={taskStyle('linear-gradient(90deg, rgba(88, 101, 242, 0.8), rgba(88, 101, 242, 0.4))', 'rgba(88, 101, 242, 0.5)')}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                📢
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>Announcement Channel</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Payouts, news & World...</div>
              </div>
              <div style={joinedButtonStyle}>✓ Joined?</div>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '-8px', marginBottom: '16px' }}>
              Opened. Tap Join inside Telegram, then come back.
            </div>

            {/* Task 2 */}
            <div style={taskStyle('linear-gradient(90deg, rgba(46, 204, 113, 0.6), rgba(46, 204, 113, 0.2))', 'rgba(46, 204, 113, 0.5)')}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                💬
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>Community Group</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>12,000+ investors, liv...</div>
              </div>
              <div style={joinedButtonStyle}>✓ Joined?</div>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '-8px', marginBottom: '16px' }}>
              Opened. Tap Join inside Telegram, then come back.
            </div>

            {/* Verification Status */}
            <div style={{ ...taskStyle('rgba(46, 204, 113, 0.1)', 'rgba(46, 204, 113, 0.3)'), justifyContent: 'center' }}>
              <div style={{ color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '1px solid var(--accent-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>✓</div>
                Verified. Your bonus is unlocked.
              </div>
            </div>
          </div>

          <div className="flex-between" style={{ marginTop: '24px', padding: '0 16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--bg-primary)', border: '1px solid var(--accent-green)', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px' }}>✓</div>
              Verified by Telegram
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-green)' }} />
              12,000+ members
            </div>
          </div>
        </Card>

        {error && (
          <div style={{ color: '#e74c3c', fontSize: '14px', marginTop: '16px', textAlign: 'center', background: 'rgba(231, 76, 60, 0.1)', padding: '12px', borderRadius: '8px' }}>
            {error}
          </div>
        )}
      </div>

      <div style={{ padding: '20px', background: 'var(--bg-primary)', position: 'sticky', bottom: 0 }}>
        {user?.verificationClaimed ? (
          <Button fullWidth variant="outline" disabled style={{ opacity: 0.5, borderColor: 'var(--accent-green)', color: 'var(--accent-green)' }}>
            ✓ Bonus Claimed
          </Button>
        ) : (
          <Button fullWidth onClick={handleClaim} disabled={loading}>
            {loading ? 'Verifying...' : '🎁 Claim my $165 bonus >'}
          </Button>
        )}
      </div>
    </div>
  );
};
