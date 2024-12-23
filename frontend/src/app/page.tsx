import { Button } from "@/components/ui/button";
import Link from "next/link"; // Import Link for navigation

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-gradient-to-b from-white to-[#f4f4f4]">
      {/* Header Section */}
      <header className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          <div className="bg-gray-500 w-10 h-10 rounded-full"></div> {/* Placeholder for logo */}
          <span className="text-black text-2xl font-bold">Study Buddies</span>
        </div>
        <nav>
          <Link href="/login">
            <Button variant="outline" className="bg-blue-600 text-white hover:bg-blue-700 rounded-full px-6 py-2">
              Login
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="default" className="bg-blue-500 text-white hover:bg-blue-600 rounded-full px-6 py-2 ml-4">
              Sign Up
            </Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start text-center sm:text-left">
        <div className="bg-gray-500 w-32 h-32 rounded-full mb-6"></div> {/* Placeholder for hero image */}
        <h1 className="text-4xl font-bold text-black leading-tight">
          Learn Smarter with <span className="text-blue-400">Study Buddies</span>
        </h1>
        <p className="text-lg text-gray-800 max-w-xl">
          Personalized learning paths, expert tutors, and collaborative study groups. Join us today!
        </p>
        <div className="flex gap-6 justify-center sm:justify-start">
          <Link href="/register">
            <Button
              variant="default"
              className="bg-blue-500 text-white hover:bg-blue-600 rounded-full px-8 py-3"
            >
              Sign Up Now
            </Button>
          </Link>
          <Link href="/learn-more"> {/* Example of a Learn More button */}
            <Button
              variant="outline"
              className="border-blue-500 text-blue-500 hover:bg-blue-600 hover:text-white rounded-full px-8 py-3"
            >
              Learn More
            </Button>
          </Link>
        </div>
      </main>

      {/* About Section */}
      <section className="flex flex-col gap-8 items-center text-center sm:text-left">
        <h2 className="text-3xl font-bold text-black">Why Study Buddies?</h2>
        <p className="text-lg text-gray-800 max-w-2xl">
          We provide a unique platform where learning is personalized to your needs. Whether you're preparing for exams
          or learning a new subject, we have the right tools for you.
        </p>
      </section>

      {/* Key Features Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 mt-16">
        <div className="flex flex-col items-center text-center bg-gray-100 p-6 rounded-lg">
          <div className="bg-blue-500 w-12 h-12 rounded-full"></div> {/* Placeholder for icon */}
          <h3 className="text-xl font-semibold text-black mt-4">Personalized Learning Paths</h3>
          <p className="text-gray-700 mt-2">Your education, your way. Tailored learning experiences just for you.</p>
        </div>
        <div className="flex flex-col items-center text-center bg-gray-100 p-6 rounded-lg">
          <div className="bg-blue-500 w-12 h-12 rounded-full"></div> {/* Placeholder for icon */}
          <h3 className="text-xl font-semibold text-black mt-4">Expert Tutors</h3>
          <p className="text-gray-700 mt-2">Learn from the best with experienced mentors and tutors.</p>
        </div>
        <div className="flex flex-col items-center text-center bg-gray-100 p-6 rounded-lg">
          <div className="bg-blue-500 w-12 h-12 rounded-full"></div> {/* Placeholder for icon */}
          <h3 className="text-xl font-semibold text-black mt-4">Collaborative Study Groups</h3>
          <p className="text-gray-700 mt-2">Join study groups and collaborate with fellow students on assignments.</p>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="mt-16 flex flex-col items-center text-center">
        <h2 className="text-3xl font-bold text-black">Ready to start learning?</h2>
        <div className="mt-6 flex gap-6 justify-center">
          <Link href="/register">
            <Button
              variant="default"
              className="bg-blue-500 text-white hover:bg-blue-600 rounded-full px-8 py-3"
            >
              Join Now
            </Button>
          </Link>
          <Link href="/login">
            <Button
              variant="outline"
              className="border-blue-500 text-blue-500 hover:bg-blue-600 hover:text-white rounded-full px-8 py-3"
            >
              Login
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center mt-20 text-gray-600">
        <a href="https://www.studybuddies.com" className="hover:underline">Privacy Policy</a>
        <a href="https://www.studybuddies.com" className="hover:underline">Terms of Service</a>
        <a href="https://www.studybuddies.com" className="hover:underline">Contact</a>
      </footer>
    </div>
  );
}
