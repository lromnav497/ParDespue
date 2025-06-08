import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#2E2E7A] via-[#1a1a4a] to-[#23235b] animate-fade-in">
      <Header />
      <main className="flex-grow w-full px-2 md:px-0 py-4 md:py-0 flex flex-col items-center justify-start animate-fade-in-up">
        {children}
      </main>
      <Footer />
      <style>
        {`
          .animate-fade-in { animation: fadeIn 1s; }
          .animate-fade-in-up { animation: fadeInUp 1s; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: translateY(0);} }
        `}
      </style>
    </div>
  );
};

export default Layout;