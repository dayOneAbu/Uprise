import { PrismaClient, UserRole, Badge, ChallengeType } from '../generated/prisma'
import { hashPassword } from 'better-auth/crypto' // Better Auth uses Scrypt by default

const prisma = new PrismaClient()

// Better Auth compatible password hash
const DEFAULT_PASSWORD = '123456789'

async function createBetterAuthPasswordHash(password: string): Promise<string> {
  const hashed = await hashPassword(password)
  return hashed
}

// Seed data generators
const firstNames = [
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn',
  'Sam', 'Jamie', 'Robin', 'Skyler', 'Dakota', 'Reese', 'Sage', 'Rowan',
  'Emerson', 'Finley', 'Harper', 'Logan', 'Parker', 'River', 'Sawyer', 'Shawn'
]

const lastNames = [
  'Chen', 'Garcia', 'Johnson', 'Kim', 'Martinez', 'Nguyen', 'Patel', 'Rodriguez',
  'Smith', 'Thompson', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore',
  'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Lee'
]

const skills = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'SQL', 'MongoDB',
  'AWS', 'Docker', 'Git', 'HTML', 'CSS', 'Figma', 'Adobe XD', 'Photoshop',
  'Java', 'C++', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'Flutter',
  'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Tableau', 'Power BI',
  'Linux', 'Bash', 'Kubernetes', 'Jenkins', 'GraphQL', 'REST APIs'
]

const industries = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce',
  'Media', 'Consulting', 'Manufacturing', 'Real Estate', 'Food & Beverage',
  'Transportation', 'Energy', 'Telecommunications', 'Retail', 'Gaming'
]

const companySizes = ['Startup (1-10)', 'Small (11-50)', 'Medium (51-200)', 'Large (201-1000)', 'Enterprise (1000+)']

const jobTitles = [
  'Frontend Developer Intern', 'Backend Developer Intern', 'Full Stack Developer Intern',
  'Data Analyst Intern', 'Machine Learning Engineer Intern', 'DevOps Engineer Intern',
  'Mobile App Developer Intern', 'UI/UX Designer Intern', 'Product Manager Intern',
  'Marketing Technology Intern', 'Business Intelligence Intern', 'Security Analyst Intern',
  'Cloud Engineer Intern', 'Quality Assurance Intern', 'Technical Writer Intern'
]

const locations = [
  'San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA', 'Boston, MA',
  'Los Angeles, CA', 'Chicago, IL', 'Denver, CO', 'Miami, FL', 'Atlanta, GA',
  'Remote', 'Hybrid', 'On-site'
]

// Utility functions
function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]!
}

function randomChoices<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const usedEmails = new Set<string>()

function generateEmail(firstName: string, lastName: string, _index: number): string {
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'company.com', 'tech.com']
  let email: string
  let attempts = 0

  do {
    const domain = randomChoice(domains)
    const suffix = attempts > 0 ? randomInt(1, 999).toString() : ''
    email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${suffix}@${domain}`
    attempts++
  } while (usedEmails.has(email) && attempts < 10)

  usedEmails.add(email)
  return email
}

function generateBio(skills: string[]): string {
  const templates = [
    `Passionate developer with expertise in ${skills.slice(0, 3).join(', ')}. Always eager to learn and contribute to innovative projects.`,
    `Computer science student interested in ${skills.slice(0, 2).join(' and ')}. Looking for internship opportunities to gain real-world experience.`,
    `Full-stack enthusiast skilled in ${skills.slice(0, 4).join(', ')}. Excited to work on challenging projects and grow professionally.`,
    `Tech-savvy individual with experience in ${skills.slice(0, 3).join(', ')}. Seeking internship to apply knowledge in practical settings.`,
    `Aspiring developer proficient in ${skills.slice(0, 2).join(' and ')}. Passionate about creating user-friendly applications and solving complex problems.`
  ]
  return randomChoice(templates)
}

function generateCompanyDescription(industry: string, size: string): string {
  const templates = [
    `Leading ${industry} company specializing in innovative solutions. We foster a collaborative environment where interns can learn from industry experts.`,
    `Growing ${industry} organization committed to excellence. Our ${size} team values creativity, innovation, and professional development.`,
    `${industry} pioneer with a reputation for quality. We provide interns with hands-on experience and mentorship from senior team members.`,
    `Dynamic ${industry} firm focused on cutting-edge technology. Our internship program offers real responsibilities and learning opportunities.`,
    `Established ${industry} company with a strong commitment to employee growth. Interns work on meaningful projects alongside experienced professionals.`
  ]
  return randomChoice(templates)
}

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data (for development/demo purposes)
  console.log('🗑️  Clearing existing data...')

  // Delete in order to avoid foreign key constraints
  await prisma.skillScore.deleteMany()
  await prisma.submissionTask.deleteMany()
  await prisma.submission.deleteMany()
  await prisma.task.deleteMany()
  await prisma.review.deleteMany()
  await prisma.contract.deleteMany()
  await prisma.application.deleteMany()
  await prisma.challenge.deleteMany() // Depends on Job and User
  await prisma.job.deleteMany()
  await prisma.company.deleteMany()
  await prisma.profile.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  console.log('✅ Database cleared')

  // Array to track all created users for password setup
  const users: { id: string; email: string }[] = []

  // ==========================================
  // DEMO ACCOUNTS FOR SHOWCASE
  // ==========================================
  console.log('👤 Creating demo accounts...')

  // Demo Employer
  const demoEmployer = await prisma.user.create({
    data: {
      id: 'demo_employer',
      name: 'Sarah Johnson',
      email: 'employer@UPrise.demo',
      emailVerified: true,
      role: UserRole.EMPLOYER,
      successRate: 95,
      totalEarnings: 0,
      badge: Badge.TOP_RATED
    }
  })

  const demoCompany = await prisma.company.create({
    data: {
      id: 'demo_company',
      name: 'TechCorp Solutions',
      slug: 'techcorp-solutions',
      description: 'Leading technology company focused on innovative web and mobile solutions. We specialize in AI-powered applications and modern SaaS platforms. Our internship program offers hands-on experience with cutting-edge technologies.',
      logoUrl: null,
      website: 'https://techcorp-solutions.demo',
      aiCredits: 100,
      members: {
        connect: { id: demoEmployer.id }
      }
    }
  })

  await prisma.user.update({
    where: { id: demoEmployer.id },
    data: { companyId: demoCompany.id }
  })

  console.log('✅ Demo Employer: employer@UPrise.demo')

  // Demo Candidate with skill scores
  const demoCandidate = await prisma.user.create({
    data: {
      id: 'demo_candidate',
      name: 'Alex Rivera',
      email: 'candidate@UPrise.demo',
      emailVerified: true,
      role: UserRole.CANDIDATE,
      successRate: 88,
      totalEarnings: 15000,
      badge: Badge.RISING_TALENT
    }
  })

  await prisma.profile.create({
    data: {
      userId: demoCandidate.id,
      bio: 'Passionate full-stack developer with expertise in React, Node.js, and modern web technologies. Computer Science student with strong problem-solving skills and a drive to learn. Looking for internship opportunities to apply my skills and grow professionally.',
      skills: 'JavaScript, TypeScript, React, Node.js, SQL, Git, HTML, CSS, Python',
      location: 'San Francisco, CA',
      portfolioUrl: 'https://alexrivera.dev'
    }
  })

  // Create skill scores for demo candidate (so they appear in blind talent pool)
  await prisma.skillScore.create({
    data: {
      candidateId: demoCandidate.id,
      skill: 'React',
      score: 92,
      submissions: 3
    }
  })
  await prisma.skillScore.create({
    data: {
      candidateId: demoCandidate.id,
      skill: 'JavaScript',
      score: 88,
      submissions: 4
    }
  })
  await prisma.skillScore.create({
    data: {
      candidateId: demoCandidate.id,
      skill: 'Node.js',
      score: 85,
      submissions: 2
    }
  })
  await prisma.skillScore.create({
    data: {
      candidateId: demoCandidate.id,
      skill: 'TypeScript',
      score: 90,
      submissions: 3
    }
  })

  console.log('✅ Demo Candidate: candidate@UPrise.demo')
  console.log('   Password: Set via Better Auth (magic link or configured)')

  // Add demo users to array for password setup
  users.push({ id: demoEmployer.id, email: demoEmployer.email })
  users.push({ id: demoCandidate.id, email: demoCandidate.email })

  // ==========================================
  // ADDITIONAL SEED DATA (50+ datasets)
  // ==========================================

  // Create 35 candidates
  for (let i = 0; i < 35; i++) {
    const firstName = randomChoice(firstNames)
    const lastName = randomChoice(lastNames)
    const userSkills = randomChoices(skills, randomInt(3, 8))

    const user = await prisma.user.create({
      data: {
        id: `user_${i + 1}`,
        name: `${firstName} ${lastName}`,
        email: generateEmail(firstName, lastName, i),
        emailVerified: Math.random() > 0.3, // 70% verified
        role: UserRole.CANDIDATE,
        successRate: randomInt(0, 100),
        totalEarnings: randomInt(0, 50000),
        badge: randomInt(0, 95) >= 70 ? Badge.RISING_TALENT :
          randomInt(0, 95) >= 85 ? Badge.TOP_RATED :
            randomInt(0, 95) >= 95 ? Badge.EXPERT : Badge.NONE
      }
    })
    users.push(user)

    // Create profile for candidate
    await prisma.profile.create({
      data: {
        userId: user.id,
        bio: generateBio(userSkills),
        skills: userSkills.join(', '),
        location: randomChoice(locations.slice(0, -3)), // Exclude Remote/Hybrid/On-site
        portfolioUrl: Math.random() > 0.6 ? `https://portfolio-${firstName.toLowerCase()}.com` : null
      }
    })

    // Create skill scores for talent pool
    for (const skill of userSkills) {
      await prisma.skillScore.create({
        data: {
          candidateId: user.id,
          skill,
          score: randomInt(65, 98), // Good scores for talent pool
          submissions: randomInt(1, 5)
        }
      })
    }
  }

  // Create 15 employers (each with a company)
  for (let i = 0; i < 15; i++) {
    const firstName = randomChoice(firstNames)
    const lastName = randomChoice(lastNames)

    const user = await prisma.user.create({
      data: {
        id: `employer_${i + 1}`,
        name: `${firstName} ${lastName}`,
        email: generateEmail(firstName, lastName, i + 100), // Offset for employers
        emailVerified: true,
        role: UserRole.EMPLOYER,
        successRate: randomInt(60, 100),
        totalEarnings: 0,
        badge: Badge.NONE
      }
    })
    users.push(user)

    // Create company for employer
    const industry = randomChoice(industries)
    const size = randomChoice(companySizes)
    const companyName = `${randomChoice(['Tech', 'Innovate', 'Future', 'NextGen', 'Smart', 'Digital'])} ${randomChoice(['Labs', 'Solutions', 'Systems', 'Group', 'Corp', 'Inc'])}`

    await prisma.company.create({
      data: {
        id: `company_${i + 1}`,
        name: companyName,
        slug: `${companyName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${i + 1}`,
        description: generateCompanyDescription(industry, size),
        logoUrl: Math.random() > 0.7 ? `https://logo-${companyName.toLowerCase().replace(/\s+/g, '-')}.com/logo.png` : null,
        website: `https://${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
        aiCredits: randomInt(10, 100),
        members: {
          connect: { id: user.id }
        }
      }
    })

    // Update user with company ID
    await prisma.user.update({
      where: { id: user.id },
      data: { companyId: `company_${i + 1}` }
    })
  }

  console.log('✅ Created 50 users (35 candidates, 15 employers)')

  // Create 60+ Jobs across different companies
  console.log('💼 Creating jobs...')
  const jobs = []

  // Create jobs for Demo Employer first
  const demoJobTitles = ['Senior React Developer', 'UI/UX Design Intern', 'Full Stack Engineer']

  for (const title of demoJobTitles) {
    const job = await prisma.job.create({
      data: {
        title,
        description: `We are looking for a ${title} to join our team at TechCorp Solutions. This is a high-impact role working on our core products.`,
        status: 'OPEN',
        locationType: 'remote',
        duration: 6,
        isPaid: true,
        salaryRange: '$4000 - $6000',
        skillsRequired: 'React, TypeScript, Node.js, TailwindCSS',
        experienceLevel: 'intermediate',
        companyId: demoCompany.id,
        employerId: demoEmployer.id
      }
    })
    jobs.push(job)

    // Create a Challenge for this demo job
    const challenge = await prisma.challenge.create({
      data: {
        title: `${title} Assessment`,
        description: `Technical assessment for the ${title} position. This challenge tests your practical skills relevant to the role.`,
        type: ChallengeType.CODE,
        timeLimit: 120, // 2 hours
        jobId: job.id,
        employerId: demoEmployer.id,
        isPublished: true
      }
    })

    // Add tasks to the challenge
    const tasks = [
      {
        title: 'Component Implementation',
        description: 'Build a reusable component according to the provided specifications.',
        order: 1
      },
      {
        title: 'API Integration',
        description: 'Connect the component to the backend API and handle data fetching.',
        order: 2
      },
      {
        title: 'Unit Testing',
        description: 'Write comprehensive unit tests for your implementation.',
        order: 3
      }
    ]

    for (const task of tasks) {
      await prisma.task.create({
        data: {
          title: task.title,
          description: task.description,
          order: task.order,
          challengeId: challenge.id
        }
      })
    }

    // Generate relevant skills for the demo job
    const demoJobSkills = title.toLowerCase().includes('frontend') ? ['JavaScript', 'React', 'HTML', 'CSS', 'TypeScript'] :
      title.toLowerCase().includes('backend') ? ['Node.js', 'Python', 'SQL', 'API Development'] :
        ['JavaScript', 'TypeScript', 'Node.js', 'React']

    // Create 3-5 submissions for this challenge from random candidates
    // This will populate the "Live Merit Activity" feed
    const submissionCandidates = randomChoices(users.filter(u => u.id !== 'demo_candidate' && u.id !== 'demo_employer'), randomInt(3, 5))
    for (const subCandidate of submissionCandidates) {
      await prisma.submission.create({
        data: {
          challengeId: challenge.id,
          candidateId: subCandidate.id,
          status: 'COMPLETED',
          overallScore: randomInt(70, 98),
          gradedAt: new Date(Date.now() - randomInt(0, 172800000)), // Last 48 hours
          skills: JSON.stringify(demoJobSkills.slice(0, 2)),
          feedback: "Demonstrated strong technical competence and clean code structure."
        }
      })

      // Link to SkillScores
      const subSkills = demoJobSkills.slice(0, 2)
      for (const skill of subSkills) {
        await prisma.skillScore.upsert({
          where: { candidateId_skill: { candidateId: subCandidate.id, skill } },
          update: {
            score: { increment: 2 },
            submissions: { increment: 1 }
          },
          create: {
            candidateId: subCandidate.id,
            skill,
            score: randomInt(75, 95),
            submissions: 1
          }
        })
      }
    }
  }

  // Also create a few submissions for the demo candidate on OTHER challenges
  // Let's create a couple of "Public" challenges for candidates to find
  console.log('🏆 Creating public challenges...')
  const publicChallengeTitles = [
    { title: 'React Performance optimization', skills: ['React', 'JavaScript'] },
    { title: 'TypeScript Design Patterns', skills: ['TypeScript', 'Architecture'] },
    { title: 'Node.js Scalability', skills: ['Node.js', 'Backend'] }
  ]

  for (const pub of publicChallengeTitles) {
    const pubChallenge = await prisma.challenge.create({
      data: {
        title: pub.title,
        description: `Prove your expertise in ${pub.title}. This public challenge helps you get discovered by premium employers.`,
        type: ChallengeType.CODE,
        timeLimit: 90,
        employerId: demoEmployer.id, // Keep it simple, or use another random employer
        isPublished: true
      }
    })

    // Submission for the demo candidate
    await prisma.submission.create({
      data: {
        challengeId: pubChallenge.id,
        candidateId: 'demo_candidate',
        status: 'COMPLETED',
        overallScore: randomInt(88, 99),
        gradedAt: new Date(Date.now() - randomInt(86400000, 432000000)), // 1-5 days ago
        skills: JSON.stringify(pub.skills),
        feedback: "Exceptional mastery demonstrated in all core areas of the assessment."
      }
    })

    // Also update demo candidate skill scores
    for (const skill of pub.skills) {
      await prisma.skillScore.upsert({
        where: { candidateId_skill: { candidateId: 'demo_candidate', skill } },
        update: { score: { increment: 1 }, submissions: { increment: 1 } },
        create: { candidateId: 'demo_candidate', skill, score: randomInt(90, 95), submissions: 1 }
      })
    }
  }

  for (let i = 0; i < 60; i++) {
    const companyId = `company_${randomInt(1, 15)}`
    const title = randomChoice(jobTitles)
    const locationType = randomChoice(['remote', 'onsite', 'hybrid'])
    const isPaid = Math.random() > 0.4 // 60% paid
    const duration = randomInt(1, 6) // 1-6 months
    const experienceLevel = randomChoice(['beginner', 'intermediate', 'advanced'])

    // Generate relevant skills based on job title
    const jobSkills = title.toLowerCase().includes('frontend') ? ['JavaScript', 'React', 'HTML', 'CSS', 'TypeScript'] :
      title.toLowerCase().includes('backend') ? ['Node.js', 'Python', 'SQL', 'API Development'] :
        title.toLowerCase().includes('data') ? ['Python', 'SQL', 'Pandas', 'Tableau'] :
          title.toLowerCase().includes('design') ? ['Figma', 'UI/UX Design', 'Prototyping'] :
            title.toLowerCase().includes('mobile') ? ['React Native', 'Flutter', 'iOS Development'] :
              randomChoices(skills, randomInt(3, 6))

    const salaryRange = isPaid ? (
      duration <= 3 ? `$${randomInt(15, 25)}/hr` :
        duration <= 6 ? `$${randomInt(2000, 4000)}/month` :
          `$${randomInt(3000, 6000)}/month`
    ) : null

    const descriptions = [
      `Join our ${companyId.replace('company_', '')} team as a ${title.toLowerCase()}. You'll work on exciting projects and learn from experienced mentors.`,
      `We're looking for a motivated ${title.toLowerCase()} to join our growing team. This is a great opportunity to gain hands-on experience.`,
      `Exciting internship opportunity for ${title.toLowerCase()}. You'll contribute to real projects and develop valuable skills.`,
      `Perfect for students interested in ${title.split(' ')[0]?.toLowerCase() || 'software'} development. Work with cutting-edge technology and learn industry best practices.`,
      `Join our innovative team as a ${title.toLowerCase()}. You'll get exposure to the latest technologies and methodologies.`
    ]

    const job = await prisma.job.create({
      data: {
        title,
        description: randomChoice(descriptions),
        status: Math.random() > 0.2 ? 'OPEN' : 'CLOSED', // 80% open
        locationType,
        duration,
        isPaid,
        salaryRange,
        skillsRequired: jobSkills.join(', '),
        experienceLevel,
        companyId,
        employerId: `employer_${companyId.replace('company_', '')}`
      }
    })
    jobs.push(job)
  }

  console.log('✅ Created 60 jobs')

  // Create 150+ Applications (realistic application rate)
  console.log('📝 Creating applications...')
  const applications = []

  for (let i = 0; i < 150; i++) {
    // 20% chance to be the demo candidate
    const isDemoCandidate = Math.random() < 0.2
    const candidateId = isDemoCandidate ? demoCandidate.id : `user_${randomInt(1, 35)}`

    // Ensure demo candidate applies to some random jobs
    // And random candidates apply to demo employer's jobs (first 3 jobs)

    let job
    if (Math.random() < 0.1) {
      // Apply to one of the demo employer's jobs
      job = jobs[randomInt(0, 2)]!
    } else {
      job = randomChoice(jobs.filter(j => j.status === 'OPEN'))
    }

    const existingApplication = await prisma.application.findUnique({
      where: {
        candidateId_jobId: {
          candidateId,
          jobId: job.id
        }
      }
    })

    if (existingApplication) continue // Skip duplicates

    const application = await prisma.application.create({
      data: {
        candidateId,
        jobId: job.id,
        status: randomChoice(['SUBMITTED', 'REVIEWING', 'ACCEPTED', 'REJECTED'])
      }
    })
    applications.push(application)

    // Note: AI analysis now happens in real-time via API calls
    // No need to pre-seed analysis data
  }

  console.log('✅ Created 150 applications')

  // Create 40+ Contracts (successful internships)
  console.log('📋 Creating contracts...')
  const acceptedApplications = applications.filter(app => app.status === 'ACCEPTED')

  for (let i = 0; i < Math.min(40, acceptedApplications.length); i++) {
    const application = acceptedApplications[i]!
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - randomInt(0, 180)) // Up to 6 months ago

    const contract = await prisma.contract.create({
      data: {
        internId: application.candidateId,
        jobId: application.jobId,
        startDate,
        status: Math.random() > 0.1 ? 'ACTIVE' : 'COMPLETED' // 90% active, 10% completed
      }
    })

    // Add feedback for completed contracts
    if (contract.status === 'COMPLETED') {
      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + randomInt(2, 6))

      await prisma.contract.update({
        where: { id: contract.id },
        data: { endDate }
      })

      // Get job details for employer ID
      const jobDetails = await prisma.job.findUnique({
        where: { id: application.jobId },
        select: { employerId: true }
      })

      if (!jobDetails) continue

      // Create reviews
      const reviewTexts = [
        "Excellent intern! Highly motivated and quick learner.",
        "Great work ethic and technical skills. Would recommend.",
        "Good performance overall, showed strong initiative.",
        "Solid contributor with room for growth in some areas.",
        "Outstanding technical abilities and professional attitude."
      ]

      await prisma.review.create({
        data: {
          contractId: contract.id,
          reviewerId: jobDetails.employerId,
          revieweeId: application.candidateId,
          rating: randomInt(3, 5),
          comment: randomChoice(reviewTexts),
          isPrivate: Math.random() > 0.7 // 30% private
        }
      })

      // Sometimes interns review employers back
      if (Math.random() > 0.6) { // 40% chance
        const internReviewTexts = [
          "Great learning experience and mentorship provided.",
          "Good company culture and supportive team.",
          "Valuable internship with real responsibilities.",
          "Excellent opportunity to learn and grow professionally.",
          "Well-structured program with clear expectations."
        ]

        await prisma.review.create({
          data: {
            contractId: contract.id,
            reviewerId: application.candidateId,
            revieweeId: jobDetails.employerId,
            rating: randomInt(3, 5),
            comment: randomChoice(internReviewTexts),
            isPrivate: false
          }
        })
      }
    }
  }

  console.log('✅ Created 40 contracts with reviews')

  // ==========================================
  // SET PASSWORDS FOR ALL USERS
  // ==========================================
  console.log('🔐 Setting up passwords (123456789)...')

  // Hash password with Better Auth compatible format
  const hashedPassword = await createBetterAuthPasswordHash(DEFAULT_PASSWORD)

  // Create Account records with credentials for all users
  for (const user of users) {
    await prisma.account.create({
      data: {
        id: `account_${user.id}`,
        accountId: user.email,
        providerId: 'credential', // Better Auth uses 'credential' for email/password
        userId: user.id,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
  }

  console.log(`✅ Set passwords for ${users.length} accounts`)

  // ==========================================
  // FINAL SUMMARY
  // ==========================================
  console.log('\n🎉 Database seeding completed!')
  console.log('\n📊 Summary:')
  console.log('- 50+ Users (35 random candidates, 15 random employers + 2 demo accounts)')
  console.log('- 15+ Companies')
  console.log('- 60 Jobs with diverse parameters')
  console.log('- 150 Applications')
  console.log('- 40 Contracts with reviews')
  console.log('\n👤 Demo Accounts (for showcase):')
  console.log('  • Employer: employer@UPrise.demo / 123456789')
  console.log('    Company: TechCorp Solutions')
  console.log('  • Candidate: candidate@UPrise.demo / 123456789')
  console.log('    Skills: React (92%), JavaScript (88%), TypeScript (90%), Node.js (85%)')
  console.log('\n🔑 All accounts use password: 123456789')
  console.log('🚀 Ready for demo!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })