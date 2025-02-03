import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Mail, Phone, X, Menu } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { app } from './config/firebase';
import { Particles } from "./components/magicui/particles";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      <ToastContainer />

      <Particles
        className="absolute inset-0 z-10"
        quantity={150}
        staticity={40}
        color="#FFFFFF"
        ease="linear"
        mouseForce={50}
        mouseRadius={150}
      />

      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-black/90 to-purple-900/80 animate-gradient-xy" />
        <div className="absolute w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.4)_100%)]" />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -top-48 -left-48"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl top-1/2 right-0"
        />
      </div>

      {/* Responsive Navigation */}
      <nav className="fixed top-0 w-full p-4 md:p-6 backdrop-blur-lg bg-black/30 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-xl md:text-2xl font-bold text-white">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              WTF_2025
            </span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            <NavLinks />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2"
            onClick={toggleMobileMenu}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden absolute top-full left-0 w-full bg-black/90 backdrop-blur-lg"
            >
              <div className="p-4 flex flex-col space-y-4">
                <NavLinks mobile onClick={() => setIsMobileMenuOpen(false)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Enhanced Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center pt-20 px-4">
        <div className="relative z-10 text-center space-y-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h1 className="text-4xl md:text-7xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
              Orion 2025
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8">
              Where Innovation Meets Reality
            </p>

            {/* Enhanced Countdown Timer */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-12">
              {Object.entries(timeLeft).map(([unit, value]) => (
                <motion.div
                  key={unit}
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-white/10 shadow-lg"
                >
                  <div className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                    {value}
                  </div>
                  <div className="text-sm uppercase text-white/60">{unit}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Events Section */}
      <section id="events" className="py-20 px-4 relative scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500"
          >
            Featured Events
          </motion.h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {events.map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, translateY: -5 }}
                className="group bg-gradient-to-br from-blue-900/30 to-purple-900/30 backdrop-blur-lg rounded-xl p-6 border border-white/10 cursor-pointer hover:border-white/20 transition-all duration-300 shadow-lg"
                onClick={() => handleEventClick(event)}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="text-4xl group-hover:scale-110 transition-transform">
                    {event.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {event.title}
                  </h3>
                </div>
                <p className="text-white/70 mb-4 group-hover:text-white/90 transition-colors">
                  {event.description}
                </p>
                <div className="flex items-center text-sm text-white/60 group-hover:text-white/80 transition-colors">
                  <Calendar className="w-4 h-4 mr-2" />
                  {event.date}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Highlights Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500"
          >
            Event Highlights
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
            {[
              { icon: "🏆", text: "₹5L+ Prize Pool" },
              { icon: "👥", text: "5000+ Participants" },
              { icon: "🌐", text: "50+ Universities" },
              { icon: "💡", text: "20+ Events" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="p-4 md:p-6 rounded-xl bg-gradient-to-br from-blue-900/50 to-purple-900/50 backdrop-blur-lg border border-white/10 hover:border-white/20 transition-all duration-300 shadow-lg"
              >
                <div className="text-3xl md:text-4xl mb-4">{item.icon}</div>
                <div className="text-lg md:text-xl text-white">{item.text}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Location Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <MapPin className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-8 text-blue-400" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              Location
            </h2>
            <p className="text-lg md:text-xl text-white/70">
              University Main Campus
              <br />
              Innovation Center, Tech Block
              <br />
              1234 University Drive
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="mt-8 px-6 py-3 border-2 border-white/20 text-white rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300 shadow-lg"
            >
              Get Directions
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Contact Section */}
      <section id="contact" className="py-20 px-4 relative scroll-mt-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              Contact Us
            </h2>
            <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
              <div className="flex items-center space-x-2 text-white/70 hover:text-blue-400 transition-colors">
                <Mail className="w-5 h-5" />
                <p>info@techfest2025.com</p>
              </div>
              <div className="flex items-center space-x-2 text-white/70 hover:text-blue-400 transition-colors">
                <Phone className="w-5 h-5" />
                <p>+1 (555) 123-4567</p>
              </div>
            </div>
            {/* <div className="mt-8 flex justify-center space-x-6">
              <SocialButton icon="Twitter" />
              <SocialButton icon="Instagram" />
              <SocialButton icon="LinkedIn" />
            </div> */}
          </motion.div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="py-8 px-4 text-center text-white/60 backdrop-blur-lg bg-black/30">
        <div className="max-w-4xl mx-auto">
          <p className="mb-4">© 2025 TechFest. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <FooterLink text="Privacy Policy" />
            <FooterLink text="Terms of Service" />
            <FooterLink text="Contact" />
          </div>
        </div>
      </footer>

      {/* Enhanced Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={closeModal}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-gradient-to-br from-blue-900/90 to-purple-900/90 p-6 rounded-2xl w-full max-w-md mx-4 border border-white/10 shadow-xl"
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
                  Register for {selectedEvent?.title}
                </h3>
                <p className="text-white/60">
                  {selectedEvent?.date}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <FormInput
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isSubmitting}
                />
                <FormInput
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isSubmitting}
                />
                <FormInput
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={isSubmitting}
                />
                <FormInput
                  type="text"
                  placeholder="University/Organization"
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                  disabled={isSubmitting}
                />
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {isSubmitting ? 'Registering...' : 'Register Now'}
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Reusable Components
const NavLinks = ({ mobile, onClick }) => {
  const links = [
    { text: "Events", section: "events" },
    { text: "Contact", section: "contact" },
  ];

  return (
    <>
      {links.map((link) => (
        <button
          key={link.text}
          onClick={() => {
            scrollToSection(link.section);
            if (onClick) onClick();
          }}
          className={`text-white hover:text-blue-400 transition-colors ${
            mobile ? "block w-full text-left" : ""
          }`}
        >
          {link.text}
        </button>
      ))}
      <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
        Register
      </button>
    </>
  );
};

const SocialButton = ({ icon }) => (
  <motion.a
    href="#"
    whileHover={{ scale: 1.1 }}
    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
  >
    <span className="text-white/60 hover:text-blue-400 transition-colors">{icon}</span>
  </motion.a>
);

const FooterLink = ({ text }) => (
  <a
    href="#"
    className="text-white/60 hover:text-blue-400 transition-colors"
  >
    {text}
  </a>
);

const FormInput = ({ type, placeholder, value, onChange, disabled }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-blue-500 transition-colors"
    required
    disabled={disabled}
  />
);

export default App;