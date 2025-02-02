import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Mail, Phone, X } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { app} from './config/firebase';

const db = getFirestore(app);

const App = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    university: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const festDate = new Date();
  festDate.setMonth(festDate.getMonth() + 1);

  useEffect(() => {
    const timer = setInterval(() => {
      const difference = festDate.getTime() - new Date().getTime();

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form data
      if (!formData.name || !formData.email || !formData.phone || !formData.university) {
        throw new Error('Please fill in all fields');
      }

      // Create registration object using server timestamp
      const registrationData = {
        ...formData,
        event: selectedEvent?.title,
        timestamp: serverTimestamp(), // Use server timestamp instead of local time
        status: 'pending',
        createdAt: new Date().toISOString() // Backup client timestamp
      };

      // Verify db is initialized
      if (!db) {
        throw new Error('Firebase is not initialized properly');
      }

      // Add to Firestore with error handling
      const registrationsRef = collection(db, "registrations");
      const docRef = await addDoc(registrationsRef, registrationData);

      console.log("Registration successful with ID:", docRef.id);

      toast.success('Registration successful! We will contact you shortly.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Reset form and close modal
      setIsModalOpen(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        university: ''
      });
    } catch (error) {
      console.error("Error submitting registration:", error);

      // More specific error messages
      let errorMessage = 'Registration failed. Please try again later.';

      if (error.message === 'Please fill in all fields') {
        errorMessage = error.message;
      } else if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check your authentication.';
      } else if (error.message === 'Firebase is not initialized properly') {
        errorMessage = 'System configuration error. Please contact support.';
      }

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const events = [
    {
      title: "Hackathon",
      description: "24-hour coding challenge to build innovative solutions",
      icon: "👾",
      date: "Day 1 - 10:00 AM"
    },
    {
      title: "Robotics Workshop",
      description: "Hands-on experience with cutting-edge robotics",
      icon: "🤖",
      date: "Day 2 - 2:00 PM"
    },
    {
      title: "Tech Talks",
      description: "Industry experts sharing insights on latest technologies",
      icon: "🎯",
      date: "Day 3 - 11:00 AM"
    }
  ];

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      <ToastContainer />

      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-black to-red-900 animate-gradient-xy" />
        <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse -top-48 -left-48" />
        <div className="absolute w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse top-1/2 right-0" />
        <div className="absolute w-full h-full bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.5)_100%)]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full p-6 backdrop-blur-lg bg-black/30 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold text-white">WTF_2025</div>
          <div className="space-x-8">
            <button
              onClick={() => scrollToSection('events')}
              className="text-white hover:text-red-400 transition-colors"
            >
              Events
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-white hover:text-red-400 transition-colors"
            >
              Contact
            </button>
            <button className="px-6 py-2 bg-gradient-to-r bg-blue-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-105">
              Register
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="relative z-10 text-center space-y-8 max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-7xl font-bold mb-4 text-white">TechFest 2025</h1>
            <p className="text-xl text-white/80 mb-8">Where Innovation Meets Reality</p>

            {/* Countdown Timer */}
            <div className="grid grid-cols-4 gap-6 mt-12">
              {Object.entries(timeLeft).map(([unit, value]) => (
                <motion.div
                  key={unit}
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-red-950/30 to-blue-950/30 backdrop-blur-lg rounded-xl p-6 border border-white/10"
                >
                  <div className="text-4xl font-bold text-white">{value}</div>
                  <div className="text-sm uppercase text-white/60">{unit}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Events Section */}
      <section id="events" className="py-20 px-4 relative scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-white">Featured Events</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {events.map((event, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleEventClick(event)}
                className="bg-gradient-to-br from-red-950/30 to-blue-950/30 backdrop-blur-lg rounded-xl p-6 border border-white/10 cursor-pointer"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="text-4xl">{event.icon}</div>
                  <h3 className="text-xl font-semibold text-white">{event.title}</h3>
                </div>
                <p className="text-white/70 mb-4">{event.description}</p>
                <div className="flex items-center text-sm text-white/60">
                  <Calendar className="w-4 h-4 mr-2" />
                  {event.date}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-white">Event Highlights</h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { icon: "🏆", text: "₹5L+ Prize Pool" },
              { icon: "👥", text: "5000+ Participants" },
              { icon: "🌐", text: "50+ Universities" },
              { icon: "💡", text: "20+ Events" }
            ].map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="p-6 rounded-xl bg-gradient-to-br from-red-950/30 to-blue-950/30 backdrop-blur-lg border border-white/10"
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <div className="text-xl text-white">{item.text}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <MapPin className="w-16 h-16 mx-auto mb-8 text-white" />
          <h2 className="text-4xl font-bold mb-4 text-white">Location</h2>
          <p className="text-xl text-white/70">
            University Main Campus
            <br />
            Innovation Center, Tech Block
            <br />
            1234 University Drive
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="mt-8 px-6 py-2 border-2 border-white/20 text-white rounded-lg bg-gradient-to-r from-red-500/20 to-blue-500/20 hover:from-red-500/30 hover:to-blue-500/30 transition-all duration-300"
          >
            Get Directions
          </motion.button>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 relative scroll-mt-20">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-4xl font-bold mb-8 text-white">Contact Us</h2>
          <div className="flex items-center justify-center space-x-2 text-white/70">
            <Mail className="w-5 h-5" />
            <p>info@techfest2025.com</p>
          </div>
          <div className="flex items-center justify-center space-x-2 text-white/70">
            <Phone className="w-5 h-5" />
            <p>+1 (555) 123-4567</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-white/60 backdrop-blur-lg bg-black/30">
        <div className="max-w-4xl mx-auto">
          <p className="mb-4">© 2025 TechFest. All rights reserved.</p>
          <div className="flex justify-center space-x-6">
            <a href="#" className="hover:text-red-400 transition-colors">Twitter</a>
            <a href="#" className="hover:text-red-400 transition-colors">Instagram</a>
            <a href="#" className="hover:text-red-400 transition-colors">LinkedIn</a>
          </div>
        </div>
      </footer>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={closeModal}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-gradient-to-br from-gray-900 to-black p-6 rounded-2xl w-full max-w-md mx-4 border border-white/10 shadow-xl"
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Register for {selectedEvent?.title}
                </h3>
                <p className="text-white/60">
                  {selectedEvent?.date}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-blue-500 transition-colors"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-blue-500 transition-colors"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-blue-500 transition-colors"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="University/Organization"
                    value={formData.university}
                    onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-blue-500 transition-colors"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Registering...' : 'Register Now'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;