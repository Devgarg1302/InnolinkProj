// import { PrismaClient, Role, ProjectStatus, ProjectType, ConnectionStatus, User, Student, Teacher, Team } from '@prisma/client';
// import { hash } from 'bcrypt';

// const prisma = new PrismaClient();

// async function main() {
//   console.log('Starting database seeding...');

//   // Clean the database first
//   await cleanup();

//   // Create users with teachers and students
//   const users = await createUsers();
//   const { teachers, students } = await createTeachersAndStudents(users);

//   // Create teams
//   const teams = await createTeams();

//   // Add team members
//   await addTeamMembers(teams, students);

//   // Create projects
//   await createProjects(teams, students, teachers);

//   // Create connections between students
//   await createConnections(students);

//   // Create experiences and certifications
//   await createExperiences(users);
//   await createCertifications(users);

//   console.log('Database seeding completed successfully!');
// }

// async function cleanup() {
//   console.log('Cleaning up database...');
  
//   const tablesToClean = [
//     'approvals',
//     'media',
//     'research_papers',
//     'notifications',
//     'connections',
//     'certifications',
//     'experiences',
//     'team_members',
//     'projects', 
//     'teams',
//     'teachers',
//     'students',
//     'users',
//   ];
  
//   for (const table of tablesToClean) {
//     await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
//   }
// }

// async function createUsers() {
//   console.log('Creating users...');
  
//   const users = [];
  
//   // Create student users
//   for (let i = 1; i <= 10; i++) {
//     const hashedPassword = await hash('password123', 10);
    
//     const user = await prisma.user.create({
//       data: {
//         email: `student${i}@thapar.edu`,
//         username: `student${i}`,
//         password: hashedPassword,
//         bio: `I am student ${i}, studying at Thapar Institute.`,
//         department: ['Computer Science', 'Electronics', 'Mechanical', 'Chemical', 'Civil'][Math.floor(Math.random() * 5)],
//         phoneNumber: `98765${String(i).padStart(5, '0')}`,
//         location: ['Patiala', 'Chandigarh', 'Delhi', 'Mumbai', 'Bangalore'][Math.floor(Math.random() * 5)],
//         website: i % 2 === 0 ? `https://student${i}.dev` : null,
//         avatarUrl: `https://randomuser.me/api/portraits/${i % 2 === 0 ? 'men' : 'women'}/${i}.jpg`,
//       }
//     });
    
//     users.push(user);
//   }
  
//   // Create teacher users
//   for (let i = 1; i <= 5; i++) {
//     const hashedPassword = await hash('teacher123', 10);
    
//     const user = await prisma.user.create({
//       data: {
//         email: `teacher${i}@thapar.edu`,
//         username: `professor${i}`,
//         password: hashedPassword,
//         bio: `I am Professor ${i}, teaching at Thapar Institute.`,
//         department: ['Computer Science', 'Electronics', 'Mechanical', 'Chemical', 'Civil'][i % 5],
//         phoneNumber: `98765${String(10 + i).padStart(5, '0')}`,
//         location: 'Patiala',
//         website: `https://professor${i}.edu`,
//         avatarUrl: `https://randomuser.me/api/portraits/${i % 2 === 0 ? 'men' : 'women'}/${10 + i}.jpg`,
//       }
//     });
    
//     users.push(user);
//   }
  
//   return users;
// }

// async function createTeachersAndStudents(users: User[]) {
//   console.log('Creating teachers and students...');
  
//   const teachers: Teacher[] = [];
//   const students: Student[] = [];
  
//   // Create students (first 10 users)
//   for (let i = 0; i < 10; i++) {
//     const user = users[i];
    
//     const student = await prisma.student.create({
//       data: {
//         userId: user.id,
//         year: Math.floor(Math.random() * 4) + 1,
//         rollNumber: `TIET${String(i + 1).padStart(5, '0')}`,
//         skills: getRandomSkills(),
//       }
//     });
    
//     students.push(student);
//   }
  
//   // Create teachers (next 5 users)
//   for (let i = 10; i < 15; i++) {
//     const user = users[i];
    
//     const teacher = await prisma.teacher.create({
//       data: {
//         userId: user.id,
//         designation: ['Assistant Professor', 'Associate Professor', 'Professor', 'Head of Department', 'Dean'][i % 5],
//         skills: getRandomSkills(),
//       }
//     });
    
//     teachers.push(teacher);
//   }
  
//   return { teachers, students };
// }

// async function createTeams() {
//   console.log('Creating teams...');
  
//   const teamNames = [
//     'Quantum Coders',
//     'Innovators Hub',
//     'Data Wizards',
//     'AI Pioneers',
//     'Sustainable Engineers'
//   ];
  
//   const teams = [];
  
//   for (let i = 0; i < teamNames.length; i++) {
//     const team = await prisma.team.create({
//       data: {
//         name: teamNames[i],
//         description: `${teamNames[i]} is a team focused on cutting-edge research and development.`,
//         isActive: true,
//       }
//     });
    
//     teams.push(team);
//   }
  
//   return teams;
// }

// async function addTeamMembers(teams: Team[], students: Student[]) {
//   console.log('Adding team members...');
  
//   // Each team will have 2-4 members
//   for (const team of teams) {
//     // Randomly select 2-4 students for this team
//     const teamSize = Math.floor(Math.random() * 3) + 2;
//     const shuffledStudents = [...students].sort(() => 0.5 - Math.random());
//     const teamStudents = shuffledStudents.slice(0, teamSize);
    
//     for (let i = 0; i < teamStudents.length; i++) {
//       const role = i === 0 ? 'LEADER' : 'MEMBER';
      
//       await prisma.teamMember.create({
//         data: {
//           teamId: team.id,
//           studentId: teamStudents[i].id,
//           role: role,
//           joinedAt: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)),
//         }
//       });
//     }
//   }
// }

// async function createProjects(teams: Team[], students: Student[], teachers: Teacher[]) {
//   console.log('Creating projects...');
  
//   const projectTypes = [
//     ProjectType.CAPSTONE,
//     ProjectType.THAPAR,
//     ProjectType.R_D,
//     ProjectType.INTERNATIONAL,
//     ProjectType.RESEARCH
//   ];
  
//   const projectStatuses = [
//     ProjectStatus.PENDING,
//     ProjectStatus.APPROVED,
//     ProjectStatus.ONGOING,
//     ProjectStatus.COMPLETED
//   ];
  
//   // Create one project for each team
//   for (let i = 0; i < teams.length; i++) {
//     const team = teams[i];
    
//     // Get team leader
//     const teamLeader = await prisma.teamMember.findFirst({
//       where: {
//         teamId: team.id,
//         role: 'LEADER'
//       },
//       include: {
//         student: true
//       }
//     });
    
//     if (!teamLeader) continue;
    
//     // Assign a mentor (teacher)
//     const mentor = teachers[Math.floor(Math.random() * teachers.length)];
    
//     // Create project
//     const project = await prisma.project.create({
//       data: {
//         title: `${team.name} Project`,
//         description: `This is a project by the ${team.name} team.`,
//         status: projectStatuses[Math.floor(Math.random() * projectStatuses.length)],
//         type: projectTypes[Math.floor(Math.random() * projectTypes.length)],
//         githubLink: `https://github.com/${team.name.toLowerCase().replace(/\s+/g, '-')}`,
//         startDate: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)),
//         endDate: Math.random() > 0.5 ? new Date(Date.now() + Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)) : null,
//         isPublic: Math.random() > 0.2,
//         teamId: team.id,
//         mentorId: mentor.id,
//         leadId: teamLeader.studentId,
//       }
//     });
    
//     // Add research papers
//     if (Math.random() > 0.5) {
//       await prisma.researchPaper.create({
//         data: {
//           projectId: project.id,
//           title: `Research on ${team.name}`,
//           authors: ['John Doe', 'Jane Smith'],
//           abstract: `This paper explores the research conducted by ${team.name}.`,
//           url: `https://papers.example.com/${project.id}`,
//           publishedAt: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)),
//         }
//       });
//     }
    
//     // Add media
//     const mediaTypes = ['IMAGE', 'VIDEO', 'DOCUMENT'];
    
//     for (let j = 0; j < 2; j++) {
//       const mediaType = mediaTypes[Math.floor(Math.random() * mediaTypes.length)];
      
//       await prisma.media.create({
//         data: {
//           projectId: project.id,
//           url: `https://media.example.com/${project.id}/${mediaType.toLowerCase()}${j}`,
//           type: mediaType,
//           title: `${mediaType} for ${project.title}`,
//           description: `This is a ${mediaType.toLowerCase()} for the project.`,
//         }
//       });
//     }
    
//     // Add approval
//     await prisma.approval.create({
//       data: {
//         projectId: project.id,
//         mentorId: mentor.id,
//         status: ['PENDING', 'APPROVED'][Math.floor(Math.random() * 2)],
//         comment: Math.random() > 0.5 ? 'Looks good to me!' : null,
//       }
//     });
    
//     // Add notifications
//     await prisma.notification.create({
//       data: {
//         userId: teamLeader.student.userId,
//         projectId: project.id,
//         type: 'PROJECT_APPROVAL',
//         message: `Your project "${project.title}" is awaiting approval.`,
//         read: Math.random() > 0.5,
//       }
//     });
//   }
// }

// async function createConnections(students: Student[]) {
//   console.log('Creating student connections...');
  
//   // Create some random connections between students
//   for (let i = 0; i < 15; i++) {
//     const requesterId = students[Math.floor(Math.random() * students.length)].id;
//     let receiverId;
    
//     // Make sure requester and receiver are different
//     do {
//       receiverId = students[Math.floor(Math.random() * students.length)].id;
//     } while (requesterId === receiverId);
    
//     // Check if connection already exists
//     const existingConnection = await prisma.connection.findFirst({
//       where: {
//         OR: [
//           { requesterId, receiverId },
//           { requesterId: receiverId, receiverId: requesterId }
//         ]
//       }
//     });
    
//     if (existingConnection) continue;
    
//     // Create connection
//     await prisma.connection.create({
//       data: {
//         requesterId,
//         receiverId,
//         status: [ConnectionStatus.PENDING, ConnectionStatus.ACCEPTED, ConnectionStatus.DECLINED][Math.floor(Math.random() * 3)],
//         message: Math.random() > 0.5 ? 'I would like to connect with you!' : null,
//       }
//     });
//   }
// }

// async function createExperiences(users: User[]) {
//   console.log('Creating experiences...');
  
//   const companies = ['Google', 'Microsoft', 'Amazon', 'Apple', 'Meta'];
//   const positions = ['Software Engineer', 'Data Scientist', 'Product Manager', 'Research Assistant', 'Intern'];
  
//   // Create 1-3 experiences for each user
//   for (const user of users) {
//     const experienceCount = Math.floor(Math.random() * 3) + 1;
    
//     for (let i = 0; i < experienceCount; i++) {
//       const startDate = new Date(Date.now() - Math.floor(Math.random() * 1000 * 24 * 60 * 60 * 1000));
//       const isCurrent = Math.random() > 0.7;
//       const endDate = isCurrent ? null : new Date(startDate.getTime() + Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000));
      
//       await prisma.experience.create({
//         data: {
//           userId: user.id,
//           position: positions[Math.floor(Math.random() * positions.length)],
//           company: companies[Math.floor(Math.random() * companies.length)],
//           startDate,
//           endDate,
//           isCurrent,
//           description: `Worked on various projects at ${companies[Math.floor(Math.random() * companies.length)]}.`,
//           location: ['Remote', 'New York', 'San Francisco', 'Bangalore', 'London'][Math.floor(Math.random() * 5)],
//         }
//       });
//     }
//   }
// }

// async function createCertifications(users: User[]) {
//   console.log('Creating certifications...');
  
//   const certifications = [
//     { title: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services' },
//     { title: 'Microsoft Certified: Azure Developer', issuer: 'Microsoft' },
//     { title: 'Google Cloud Professional Data Engineer', issuer: 'Google Cloud' },
//     { title: 'TensorFlow Developer Certificate', issuer: 'Google' },
//     { title: 'Certified ScrumMaster', issuer: 'Scrum Alliance' },
//   ];
  
//   // Create 0-2 certifications for each user
//   for (const user of users) {
//     const certificationCount = Math.floor(Math.random() * 3);
    
//     if (certificationCount === 0) continue;
    
//     // Randomly select certifications
//     const shuffledCerts = [...certifications].sort(() => 0.5 - Math.random());
//     const userCertifications = shuffledCerts.slice(0, certificationCount);
    
//     for (const cert of userCertifications) {
//       const issueDate = new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000));
//       const hasExpiry = Math.random() > 0.5;
//       const expiryDate = hasExpiry ? new Date(issueDate.getTime() + 365 * 24 * 60 * 60 * 1000) : null;
      
//       await prisma.certification.create({
//         data: {
//           userId: user.id,
//           title: cert.title,
//           issuer: cert.issuer,
//           issueDate,
//           expiryDate,
//           credentialId: Math.random().toString(36).substring(2, 10).toUpperCase(),
//           credentialUrl: `https://credentials.example.com/${Math.random().toString(36).substring(2, 10)}`,
//           description: `Certification for ${cert.title}`,
//           isVerified: Math.random() > 0.3,
//         }
//       });
//     }
//   }
// }

// function getRandomSkills() {
//   const allSkills = [
//     'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Python', 
//     'Data Analysis', 'Machine Learning', 'AI', 'Cloud Computing', 'AWS', 
//     'Azure', 'Docker', 'Kubernetes', 'CI/CD', 'Java', 'C++', 'Rust',
//     'Blockchain', 'IoT', 'Mobile Development', 'UI/UX Design', 'DevOps'
//   ];
  
//   const skillCount = Math.floor(Math.random() * 5) + 1;
//   const shuffledSkills = [...allSkills].sort(() => 0.5 - Math.random());
//   return shuffledSkills.slice(0, skillCount);
// }

// main()
//   .then(async () => {
//     await prisma.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error(e);
//     await prisma.$disconnect();
//     process.exit(1);
//   });
