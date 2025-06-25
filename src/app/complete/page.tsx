'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import React from 'react';

export default function CompletePage() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  // 未ログイン時は/loginにリダイレクト
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
      } else {
        // ログイン済みなら自動ログアウト
        supabase.auth.signOut();
      }
    })();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="relative w-[448px] mx-auto p-8 space-y-8 bg-white/15 [backdrop-filter:blur(10px)] border border-white/30 rounded-2xl shadow-2xl overflow-hidden">
        {/* 光沢レイヤー */}
        <div
          className="absolute top-0 left-0 w-full h-1/2 pointer-events-none"
          style={{
            background: 'linear-gradient(120deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 60%, rgba(255,255,255,0.01) 100%)',
            borderTopLeftRadius: '1rem',
            borderTopRightRadius: '1rem',
            filter: 'blur(4px)'
          }}
        />
        <div className="relative z-10 text-center">
          <h2 className="text-3xl font-bold text-text mb-4">登録が完了しました！</h2>
          <p className="text-text mb-8">ご登録ありがとうございます。<br />ログイン画面からToDoアプリをご利用ください。</p>
          <button
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative w-full flex justify-center py-3 rounded-[2rem] overflow-hidden text-white text-base font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-100"
            style={
              isHovered
                ? {
                    background: 'var(--tw-color-primary, #2563eb)',
                    border: 'none',
                    boxShadow: '0 0 0 1.5px rgba(37, 99, 235, 0.8) inset, 0 0 16px 4px rgba(37, 99, 235, 0.6) inset',
                  }
                : {
                    background: 'rgba(37, 99, 235, 0.5)',
                    backdropFilter: 'blur(32px)',
                    WebkitBackdropFilter: 'blur(32px)',
                    border: 'none',
                    boxShadow: '0 0 0 1.5px rgba(37, 99, 235, 0.6) inset, 0 0 16px 4px rgba(37, 99, 235, 0.4) inset',
                  }
            }
            onClick={() => router.push('/login')}
          >
            <span className="relative z-10">ログイン画面へ</span>
            <span
              className="absolute inset-0 rounded-[2rem] pointer-events-none"
              style={{
                boxShadow: '0 0 0 1px rgba(37, 99, 235, 0.8) inset, 0 0 24px 4px rgba(37, 99, 235, 0.5) inset',
                background:
                  'radial-gradient(circle at 50% 40%, rgba(37, 99, 235, 0.6) 0%, rgba(37, 99, 235, 0.2) 80%, rgba(37, 99, 235, 0.00) 100%)',
                mixBlendMode: 'screen',
              }}
            />
          </button>
        </div>
      </div>
    </div>
  );
} 