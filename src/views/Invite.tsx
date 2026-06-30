import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Header } from '../components/Header';
import { Button } from '../components/ui/Button';
import { api } from '../api/client';
import type { AppUser, TopReferrer } from '../types';

interface InviteProps {
  onBack: () => void;
  user: AppUser | null;
}


export const Invite: React.FC<InviteProps> = ({ onBack, user }) => {
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({ networkSize: 0, totalEarned: 0, levels: [{level:1, count:0}, {level:2, count:0}, {level:3, count:0}] });
  const [topReferrers, setTopReferrers] = useState<TopReferrer[]>([]);
  
  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        const data = (await api.getReferrals()) as { networkSize: number; totalEarned: number; levels: { level: number; count: number; }[] };
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch referrals:', err);
      }
    };

    const fetchTop = async () => {
      try {
        const data = (await api.getTopReferrers()) as { topReferrers: TopReferrer[] };
        setTopReferrers(data.topReferrers || []);
      } catch (err) {
        console.error('Failed to fetch top referrers:', err);
      }
    };

    fetchReferrals();
    fetchTop();
  }, []);

  const referralLink = user ? `https://t.me/AlgotradeGlobal_Bot?start=${user.id}` : 'https://t.me/AlgotradeGlobal_Bot';

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const shareLink = () => {
    const text = encodeURIComponent('Join AlgoTrade and start earning with AI! 🚀');
    const url = encodeURIComponent(referralLink);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  };

  return (
    <div style={{ paddingBottom: '120px', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header showBack onBack={onBack} />
      
      <div style={{ padding: '0 20px', flex: 1 }}>
        <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>$4 per friend · withdraw anytime</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' }}>
          Every friend who joins puts <strong>$4</strong> into your wallet, unlocked the moment they make their first deposit. Plus <strong>15%</strong> · 5% · 2% across 3 levels, forever.
        </p>

        {/* Referral Wallet Card */}
        <Card variant="blue-gradient" style={{ marginBottom: '16px' }}>
          <div className="flex-between" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🎁</span>
              <span style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px' }}>REFERRAL WALLET</span>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '20px' }}>📚</span>
            </div>
          </div>
          
          <div style={{ fontSize: '48px', fontWeight: 800, marginBottom: '8px' }}>${stats.totalEarned.toFixed(2)}</div>
          <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '24px' }}>
            $4 per friend, locked until their first deposit.
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '12px', opacity: 0.8 }}>
              YOUR NETWORK · {stats.networkSize} PEOPLE
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { level: 1, pct: '15%', count: stats.levels[0]?.count || 0 },
                { level: 2, pct: '5%', count: stats.levels[1]?.count || 0 },
                { level: 3, pct: '2%', count: stats.levels[2]?.count || 0 }
              ].map(l => (
                <div key={l.level} style={{ flex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '8px', fontWeight: 'bold' }}>LEVEL {l.level}</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>{l.count}</div>
                  <div style={{ fontSize: '10px', opacity: 0.6 }}>{l.pct}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <Button variant="outline" style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '8px' }}>
            <span>✨</span> How it works
          </Button>
          <Button variant="outline" style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '8px' }}>
            <span>👥</span> My referrals
          </Button>
        </div>

        {/* Invite Link Card */}
        <Card variant="solid" style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '12px' }}>
            YOUR INVITE LINK
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', marginBottom: '16px', wordBreak: 'break-all', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
            {referralLink}
          </div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <Button variant="primary" onClick={shareLink} style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <span>✈️</span> Telegram
            </Button>
            <Button variant="outline" onClick={copyLink} style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <span>📋</span> {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span>🔗</span> Share Invite Link
          </div>
        </Card>

        {/* Referral Earnings */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--text-secondary)' }}>
          <span>$</span>
          <span style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px' }}>YOUR REFERRAL EARNINGS</span>
        </div>

        <Card variant="solid" style={{ marginBottom: '32px' }}>
          <div className="flex-between" style={{ marginBottom: '24px' }}>
            <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--accent-green)' }}>${stats.totalEarned.toFixed(2)}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>lifetime, all levels</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { level: 1, pct: '15% (+10% first)', count: stats.levels[0]?.count || 0, color: 'var(--accent-blue)', bg: 'rgba(88, 101, 242, 0.2)' },
              { level: 2, pct: '5%', count: stats.levels[1]?.count || 0, color: 'var(--accent-purple)', bg: 'rgba(138, 43, 226, 0.2)' },
              { level: 3, pct: '2%', count: stats.levels[2]?.count || 0, color: 'var(--accent-green)', bg: 'rgba(46, 204, 113, 0.2)' }
            ].map(l => (
              <div key={l.level} className="flex-between">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: l.bg, color: l.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                    {l.level}
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '2px' }}>Level {l.level} · {l.pct}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{l.count} people</div>
                  </div>
                </div>
                <div style={{ fontWeight: 'bold', color: 'var(--accent-green)' }}>
                  +${(l.count * 4).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Milestones */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--text-secondary)' }}>
          <span>🏆</span>
          <span style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px' }}>MILESTONES</span>
        </div>

        <Card variant="solid" style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            {[
              { title: 'Bronze Referrer', req: '5 direct referrals' },
              { title: 'Silver Referrer', req: '15 direct referrals' },
              { title: 'Gold Referrer', req: '50 direct referrals' },
            ].map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', opacity: 0.5 }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: 'var(--text-secondary)' }}>
                  🔒
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '2px' }}>{m.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{m.req}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', margin: '16px -20px' }} />
          
          <div className="flex-between" style={{ marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Progress to <strong style={{ color: '#fff' }}>Bronze Referrer</strong></span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>0/5</span>
          </div>
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: '0%', height: '100%', background: 'var(--text-primary)' }} />
          </div>
        </Card>

        {/* Top Referrers Leaderboard */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--text-secondary)' }}>
          <span>🏆</span>
          <span style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px' }}>TOP REFERRERS</span>
        </div>

        <Card variant="solid" style={{ marginBottom: '32px', overflow: 'hidden', padding: 0 }}>
          {topReferrers.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {topReferrers.map((referrer, idx) => {
                let badgeColor = 'var(--text-secondary)';
                if (idx === 0) badgeColor = '#FFD700'; // Gold
                if (idx === 1) badgeColor = '#C0C0C0'; // Silver
                if (idx === 2) badgeColor = '#CD7F32'; // Bronze

                return (
                  <div key={referrer.id} style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: idx !== topReferrers.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                    <div style={{ width: '30px', fontWeight: 'bold', color: badgeColor, fontSize: idx < 3 ? '18px' : '14px' }}>
                      {idx < 3 ? '👑' : `#${idx + 1}`}
                    </div>
                    <div style={{ flex: 1, marginLeft: '12px' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{referrer.firstName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{referrer.username ? `@${referrer.username}` : `ID: ${referrer.id}`}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '16px', color: 'var(--accent-green)' }}>{referrer.count}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>invites</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
              No referrers yet. Be the first to invite!
            </div>
          )}
        </Card>

        <div style={{ textAlign: 'center', color: 'var(--accent-blue)', fontWeight: 'bold', fontSize: '14px' }}>
          📈 Start referring to build your network and climb the leaderboard!
        </div>

      </div>
    </div>
  );
};
