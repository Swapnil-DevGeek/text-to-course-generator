import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { TextAnimate } from '@/components/ui/text-animate';
import { WordRotate } from '@/components/ui/word-rotate';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { MagicCard } from '@/components/ui/magic-card';
import { Particles } from '@/components/ui/particles';
import { AnimatedGridPattern } from '@/components/ui/animated-grid-pattern';
import { NumberTicker } from '@/components/ui/number-ticker';
import { 
  BookOpen, 
  Sparkles, 
  Layers, 
  Download, 
  Play,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

export function Home() {
  const { isAuthenticated, user } = useAuthStore();

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Generation",
      description: "Transform any topic into comprehensive courses with intelligent content structuring and automatic lesson planning.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Layers,
      title: "Smart Course Structure",
      description: "Automatically organize content into logical modules and progressive lessons for optimal learning outcomes.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: BookOpen,
      title: "Rich Content Creation",
      description: "Generate detailed lesson content with objectives, key topics, interactive elements, and curated resources.",
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: Download,
      title: "Multiple Export Formats",
      description: "Export your courses as PDFs, interactive web content, or import into popular learning management systems.",
      color: "from-orange-500 to-red-500",
    },
  ];

  const stats = [
    { number: 10000, suffix: "+", label: "Courses Created" },
    { number: 50000, suffix: "+", label: "Students Reached" },
    { number: 95, suffix: "%", label: "Satisfaction Rate" },
    { number: 24, suffix: "/7", label: "AI Availability" },
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Background Effects */}
      <AnimatedGridPattern 
        className="absolute inset-0 opacity-30" 
        numSquares={30} 
        maxOpacity={0.1}
        duration={3}
        repeatDelay={1}
      />
      <Particles
        className="absolute inset-0"
        quantity={50}
        ease={80}
        color="#3b82f6"
        refresh
      />

      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-20 bg-white/80 backdrop-blur-sm border-b border-gray-200/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Course Craft
                </h1>
                <p className="text-sm text-gray-600">AI-Powered Course Generator</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-gray-700">
                    Welcome, {user?.name}
                  </span>
                  <Button asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/signup">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-8"
            >
              <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl lg:text-7xl mb-4 leading-tight">
                <span className="inline-flex items-baseline gap-4">
                  Transform
                  <WordRotate 
                    words={["Ideas", "Topics", "Concepts", "Knowledge"]}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                  />
                </span>
                <br />
                into Structured Courses
              </h1>
            </motion.div>

            <TextAnimate
              text="Generate comprehensive online courses from any topic using AI. Create detailed lesson plans, learning objectives, and curated resources in minutes."
              type="fadeInUp"
              delay={0.4}
              className="mt-6 max-w-3xl mx-auto text-xl text-gray-600 leading-relaxed"
            />

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-4"
            >
              {isAuthenticated ? (
                <ShimmerButton className="px-8 py-4 text-lg">
                  <Link to="/dashboard" className="flex items-center gap-2">
                    Start Creating <ArrowRight className="w-5 h-5" />
                  </Link>
                </ShimmerButton>
              ) : (
                <>
                  <ShimmerButton className="px-8 py-4 text-lg">
                    <Link to="/signup" className="flex items-center gap-2">
                      Get Started Free <ArrowRight className="w-5 h-5" />
                    </Link>
                  </ShimmerButton>
                  <Button variant="outline" size="lg" className="px-8 py-4 text-lg" asChild>
                    <Link to="/login" className="flex items-center gap-2">
                      <Play className="w-5 h-5" /> Watch Demo
                    </Link>
                  </Button>
                </>
              )}
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    <NumberTicker
                      value={stat.number}
                      suffix={stat.suffix}
                      delay={index * 200}
                    />
                  </div>
                  <div className="text-gray-600 mt-2">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <TextAnimate
              text="Powerful Features"
              type="fadeInUp"
              className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4"
            />
            <TextAnimate
              text="Everything you need to create exceptional learning experiences"
              type="fadeInUp"
              delay={0.2}
              className="text-xl text-gray-600 max-w-2xl mx-auto"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <MagicCard className="p-8 h-full hover:shadow-xl transition-all duration-300">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </MagicCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <TextAnimate
              text="How It Works"
              type="fadeInUp"
              className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4"
            />
            <TextAnimate
              text="Create your first course in just three simple steps"
              type="fadeInUp"
              delay={0.2}
              className="text-xl text-gray-600"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Describe Your Topic",
                description: "Simply enter the subject you want to teach. Our AI understands context and learning objectives.",
              },
              {
                step: "02", 
                title: "AI Generates Structure",
                description: "Watch as your course takes shape with modules, lessons, and comprehensive content automatically created.",
              },
              {
                step: "03",
                title: "Publish & Share",
                description: "Export your course in multiple formats or share directly with students. Start teaching immediately.",
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">{step.step}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <TextAnimate
            text="Ready to Start Creating?"
            type="fadeInUp"
            className="text-3xl lg:text-4xl font-bold text-white mb-6"
          />
          <TextAnimate
            text="Join thousands of educators and creators who are transforming education with Course Craft"
            type="fadeInUp"
            delay={0.2}
            className="text-xl text-blue-100 mb-12 leading-relaxed"
          />
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4"
          >
            {!isAuthenticated && (
              <ShimmerButton 
                className="px-8 py-4 text-lg"
                background="linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)"
              >
                <Link to="/signup" className="flex items-center gap-2 text-gray-900">
                  Start Your Free Course <ArrowRight className="w-5 h-5" />
                </Link>
              </ShimmerButton>
            )}
            <div className="flex items-center gap-2 text-blue-100">
              <CheckCircle className="w-5 h-5" />
              <span>No credit card required</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Course Craft</span>
            </div>
            <div className="text-sm text-gray-400">
              © 2025 Course Craft. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}