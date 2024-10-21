import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Briefcase, FileText, MessageSquare, GraduationCap, Clock, File } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const floatingIcons = [
    { icon: <FileText className="w-8 h-8" />, color: 'text-blue-400' },
    { icon: <MessageSquare className="w-8 h-8" />, color: 'text-purple-400' },
    { icon: <File className="w-8 h-8" />, color: 'text-green-400' },
    { icon: <Clock className="w-8 h-8" />, color: 'text-orange-400' },
    { icon: <File className="w-8 h-8" />, color: 'text-pink-400' },
  ]

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <nav className="container mx-auto px-6 py-4">
          <ul className="flex justify-center space-x-8">
            <li><a href="#home" className="text-white hover:text-blue-300 transition-colors">Home</a></li>
            <li><a href="#how-it-works" className="text-white hover:text-blue-300 transition-colors">How It Works</a></li>
            <li><a href="#features" className="text-white hover:text-blue-300 transition-colors">Features</a></li>
            <li><a href="#animation" className="text-white hover:text-blue-300 transition-colors">Process</a></li>
            <li><a href="#contact" className="text-white hover:text-blue-300 transition-colors">Contact</a></li>
          </ul>
        </nav>
      </header>

      <main>
        <section id="home" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-0 w-full h-full">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              aria-hidden="true"
            >
              <source src="/jobtracker.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="absolute inset-0 bg-black bg-opacity-60"></div>
          </div>
          <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
            <motion.h1 
              className="text-5xl font-bold mb-4 text-white"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Revolutionize Your Job Search Experience
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-200 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              AI-powered tools to streamline your job applications and boost your career prospects
            </motion.p>
            <motion.button 
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-colors text-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/signup">Get Started</Link>
            </motion.button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent"></div>
        </section>

        <section id="how-it-works" className="py-20">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold mb-12 text-center text-gray-900">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "Track Applications", description: "Easily manage and monitor all your job applications in one place." },
                { title: "Generate AI Resumes", description: "Create tailored resumes for each application with our AI-powered tool." },
                { title: "Analyze Progress", description: "Get insights and statistics to optimize your job search strategy." }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  className="bg-white p-6 rounded-lg shadow-lg"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold mb-12 text-center text-gray-900">Features</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                { title: "AI Resume Generation", description: "Create professional resumes tailored to each job application." },
                { title: "Application Tracking", description: "Keep track of all your job applications in one centralized dashboard." },
                { title: "Progress Analytics", description: "Visualize your job search progress with insightful charts and graphs." },
                { title: "Interview Preparation", description: "Get AI-powered interview tips and common question suggestions." }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  className="bg-white p-6 rounded-lg shadow-md"
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="animation" className="py-20 bg-blue-50">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold mb-12 text-center text-gray-900">Our Process</h2>
            <div className="relative w-64 h-64 mx-auto">
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                {floatingIcons.map((item, index) => {
                  const angle = (index / floatingIcons.length) * Math.PI * 2
                  const x = Math.cos(angle) * 100
                  const y = Math.sin(angle) * 100
                  return (
                    <motion.div
                      key={index}
                      className={`absolute ${item.color} bg-white rounded-full p-3 shadow-lg`}
                      style={{
                        x: x,
                        y: y,
                        left: '50%',
                        top: '50%',
                      }}
                    >
                      {item.icon}
                    </motion.div>
                  )
                })}
              </motion.div>
              <motion.div 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-600 bg-white rounded-full p-4 shadow-lg"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  repeatType: "loop",
                }}
              >
                <GraduationCap className="w-12 h-12" />
              </motion.div>
            </div>
            <div className="mt-12 text-center max-w-2xl mx-auto">
              <p className="text-xl text-gray-600">
                Our AI-powered platform guides you through every step of your job search journey,
                from creating tailored resumes to tracking applications and preparing for interviews.
              </p>
            </div>
          </div>
        </section>

        <section id="contact" className="py-20">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold mb-12 text-center text-gray-900">Contact Us</h2>
            <div className="max-w-md mx-auto">
              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block mb-2 text-gray-700">Name</label>
                  <input type="text" id="name" className="w-full px-4 py-2 rounded border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-200" required />
                </div>
                <div>
                  <label htmlFor="email" className="block mb-2 text-gray-700">Email</label>
                  <input type="email" id="email" className="w-full px-4 py-2 rounded border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-200" required />
                </div>
                <div>
                  <label htmlFor="message" className="block mb-2 text-gray-700">Message</label>
                  <textarea id="message" rows={4} className="w-full px-4 py-2 rounded border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-200" required></textarea>
                </div>
                <motion.button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition-colors w-full text-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Send Message
                </motion.button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-6 text-center text-gray-600">
          <p>&copy; 2024 Job Application Tracker & AI Resume Generator. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}