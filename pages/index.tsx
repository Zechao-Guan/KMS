import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Bookmark } from 'lucide-react'

export default function Home() {
  return (
    <main className="bg-gradient-to-br from-[#f0f4ff] to-[#ffffff] dark:from-[#111] dark:to-[#222] min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center px-4 py-20"
      >
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl md:text-5xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300"
        >
          Knowledge Hub
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg text-gray-600 dark:text-gray-400 text-center mb-12 max-w-2xl"
        >
          Your personal space for managing papers and vocabulary
        </motion.p>

        <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            whileHover={{ scale: 1.03, y: -5 }}
            whileTap={{ scale: 0.97 }}
            className="w-full md:w-[320px]"
          >
            <Card className="rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-md border border-white/30 shadow-xl p-8 flex flex-col h-full">
              <CardHeader className="space-y-4 flex-1 flex flex-col items-center">
                <motion.div 
                  className="p-4 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 rounded-2xl mb-2"
                  whileHover={{ rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <BookOpen className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                </motion.div>
                <div className="space-y-2 w-full">
                  <div className="h-[72px] flex items-center justify-center">
                    <CardTitle className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-300">
                      Paper Management
                    </CardTitle>
                  </div>
                  <CardDescription className="text-sm text-muted-foreground text-center leading-relaxed">
                    Track and manage your academic papers with ease
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <Link href="/papers">
                  <Button className="w-full rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#444] dark:to-[#222] text-black dark:text-white px-8 py-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-medium">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            whileHover={{ scale: 1.03, y: -5 }}
            whileTap={{ scale: 0.97 }}
            className="w-full md:w-[320px]"
          >
            <Card className="rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-md border border-white/30 shadow-xl p-8 flex flex-col h-full">
              <CardHeader className="space-y-4 flex-1 flex flex-col items-center">
                <motion.div 
                  className="p-4 bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20 rounded-2xl mb-2"
                  whileHover={{ rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Bookmark className="w-10 h-10 text-green-600 dark:text-green-400" />
                </motion.div>
                <div className="space-y-2 w-full">
                  <div className="h-[72px] flex items-center justify-center">
                    <CardTitle className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-400 dark:from-green-400 dark:to-green-300">
                      Vocabulary
                    </CardTitle>
                  </div>
                  <CardDescription className="text-sm text-muted-foreground text-center leading-relaxed">
                    Build and review your vocabulary effectively
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <Link href="/words">
                  <Button className="w-full rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#444] dark:to-[#222] text-black dark:text-white px-8 py-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-medium">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </main>
  )
} 