import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Toaster } from 'react-hot-toast';

export default function PrintingServiceProviderProfile() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col ">
      {/* Sticky Navbar */}
      <div className="sticky top-0 z-50 shadow-md bg-white/80 backdrop-blur-md animate-fade-in-down">
        <Navbar />
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full">
        <section className="relative max-w-7xl mx-auto px-2 sm:px-4 md:px-8 pt-8 pb-2 mt-16">
          <div className="rounded-2xl shadow-xl bg-white/90 backdrop-blur-md p-0 md:p-2 lg:p-4">
            <h1 className="text-2xl font-bold text-center p-8">Printing Service Provider Profile</h1>
            <p className="text-center p-8">This page is under construction.</p>
          </div>
        </section>
      </main>

      {/* Toasts */}
      <Toaster />

      {/* Footer */}
      <footer className="mt-16 animate-fade-in-up">
        <Footer />
      </footer>
    </div>
  );
}
