// components/HowItWorks.tsx
"use client"; // Diperlukan untuk menggunakan hook
import React from 'react';

const Step = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="flex flex-col items-center text-center p-4 rounded-lg transition-all duration-300 hover:bg-card hover:shadow-lg">
    <div className="flex-shrink-0 bg-primary/10 p-4 rounded-full mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-bold mb-2 text-foreground">{title}</h3>
    <p className="text-foreground/80">{description}</p>
  </div>
);

const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      title: "Pilih Paket",
      description: "Pilih paket wisata atau layanan yang paling sesuai dengan keinginan Anda.",
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      title: "Input Data Diri",
      description: "Isi nama dan nomor telepon Anda yang dapat dihubungi untuk proses selanjutnya.",
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      title: "Pembayaran DP",
      description: "Lakukan pembayaran down payment (DP) untuk mengamankan pesanan Anda.",
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Penyiapan Layanan",
      description: "Tim kami akan segera menyiapkan semua kebutuhan perjalanan Anda dengan cermat.",
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h8z" />
        </svg>
      ),
      title: "Konfirmasi Akhir",
      description: "Kami akan menghubungi Anda untuk konfirmasi akhir dan detail penting perjalanan.",
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      ),
      title: "Pelaksanaan",
      description: "Nikmati perjalanan Anda! Kami akan memastikan semuanya berjalan lancar.",
    },
  ];
  return (
    <section className="bg-background py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-2">Cara Kerja Kami</h2>
          <p className="text-foreground/80">Proses mudah untuk merencanakan perjalanan impian Anda.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <Step key={index} icon={step.icon} title={step.title} description={step.description} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;