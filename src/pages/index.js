import React, {useEffect,  } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  const create = async (e) => {
    e.preventDefault();


    router.push(`/mesh`);
  };
  const create2 = async (e) => {
    e.preventDefault();


    router.push(`/mesh2`);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100vw'
    }}> 
      <div className="button" onClick={create}>Enter Blur Face Demo</div>
      <div className="button" onClick={create2}>Enter P2P WebRTC app with Blur </div>
    </div>
  );
};

