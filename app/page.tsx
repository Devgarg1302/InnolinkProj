"use client"

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function Home() {
  const { data: session } = useSession();

  useEffect(() => {
    // // Redirect to dashboard if user is already signed in
    // if (session) {
    //   window.location.href = '/dashboard';
    if (session) {
      signOut();
      localStorage.removeItem('token');
    }
  }, [session]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header/Navigation */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-600">TechCollab</h1>
          </div>
          <nav className="flex space-x-4">
            <Link href="/auth/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Login
            </Link>
            <Link href="/auth/register" className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
              Register
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Collaborate on Academic</span>
                <span className="block text-blue-600">and Research Projects</span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                A platform for students and teachers to collaborate on projects,
                share ideas, and build innovative solutions together.
              </p>
              <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                <div className="rounded-md shadow">
                  <Link href="/auth/register" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10">
                    Get started
                  </Link>
                </div>
                {/* <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                  <Link href="/projects" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10">
                    Browse Projects
                  </Link>
                </div> */}
              </div>
            </div>
          </div>
        </section>

        {/* Project Categories */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">
                Project Categories
              </h2>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                Explore different types of projects or start your own in any category
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {/* Capstone Projects */}
              <div className="bg-blue-50 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <h3 className="text-xl font-medium text-blue-800">Capstone Projects</h3>
                  <p className="mt-2 text-base text-gray-600">
                    Final year projects demonstrating comprehensive skills and knowledge
                  </p>
                  <div className="mt-4">
                    <Link href="/projects/capstone" className="text-blue-600 hover:text-blue-800 font-medium">
                      View projects →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Thapar Projects */}
              <div className="bg-indigo-50 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <h3 className="text-xl font-medium text-indigo-800">Thapar Projects</h3>
                  <p className="mt-2 text-base text-gray-600">
                    Projects specific to Thapar University courses and departments
                  </p>
                  <div className="mt-4">
                    <Link href="/projects/thapar" className="text-indigo-600 hover:text-indigo-800 font-medium">
                      View projects →
                    </Link>
                  </div>
                </div>
              </div>

              {/* R&D Projects */}
              <div className="bg-purple-50 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <h3 className="text-xl font-medium text-purple-800">R&D Projects</h3>
                  <p className="mt-2 text-base text-gray-600">
                    Research and development initiatives pushing boundaries
                  </p>
                  <div className="mt-4">
                    <Link href="/projects/research-development" className="text-purple-600 hover:text-purple-800 font-medium">
                      View projects →
                    </Link>
                  </div>
                </div>
              </div>

              {/* International Projects */}
              <div className="bg-green-50 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <h3 className="text-xl font-medium text-green-800">International Projects</h3>
                  <p className="mt-2 text-base text-gray-600">
                    Global collaboration projects with international universities
                  </p>
                  <div className="mt-4">
                    <Link href="/projects/international" className="text-green-600 hover:text-green-800 font-medium">
                      View projects →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">
                Platform Features
              </h2>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                Everything you need to manage and collaborate on academic projects
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="w-12 h-12 rounded-md bg-blue-100 flex items-center justify-center text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Team Collaboration</h3>
                <p className="mt-2 text-base text-gray-500">
                  Create teams, assign roles, and collaborate in real-time on projects
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="w-12 h-12 rounded-md bg-blue-100 flex items-center justify-center text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Mentor Guidance</h3>
                <p className="mt-2 text-base text-gray-500">
                  Get guidance from faculty mentors who can approve projects and provide feedback
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="w-12 h-12 rounded-md bg-blue-100 flex items-center justify-center text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Document Sharing</h3>
                <p className="mt-2 text-base text-gray-500">
                  Share research papers, reports, and presentations with your team and mentors
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="w-12 h-12 rounded-md bg-blue-100 flex items-center justify-center text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Student Profiles</h3>
                <p className="mt-2 text-base text-gray-500">
                  Create personal profiles showcasing your skills, experiences, and certifications
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="w-12 h-12 rounded-md bg-blue-100 flex items-center justify-center text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Project Gallery</h3>
                <p className="mt-2 text-base text-gray-500">
                  Upload images, videos, and other media to showcase your projects progress
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="w-12 h-12 rounded-md bg-blue-100 flex items-center justify-center text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Student Discovery</h3>
                <p className="mt-2 text-base text-gray-500">
                  Find and connect with students who have the skills you need for your project
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">TechCollab</h3>
              <p className="text-gray-300">
                A collaborative platform for academic and research projects.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Navigation</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-300 hover:text-white">Home</Link></li>
                <li><Link href="/projects" className="text-gray-300 hover:text-white">Browse Projects</Link></li>
                <li><Link href="/login" className="text-gray-300 hover:text-white">Login</Link></li>
                <li><Link href="/register" className="text-gray-300 hover:text-white">Register</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <p className="text-gray-300">
                Thapar Institute of Engineering & Technology<br />
                Patiala, Punjab, India
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} TechCollab. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
