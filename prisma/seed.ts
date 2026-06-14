import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('开始创建测试数据...')

  // 创建测试教师用户
  const hashedPassword = await bcrypt.hash('password123', 10)

  // 检查并创建教师1
  let teacher1 = await prisma.user.findUnique({
    where: { email: 'teacher1@talkyone.com' },
    include: { teacher: true },
  })

  if (!teacher1) {
    teacher1 = await prisma.user.create({
      data: {
        email: 'teacher1@talkyone.com',
        password: hashedPassword,
        name: 'Marie Dupont',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marie',
        role: 'TEACHER',
        teacher: {
          create: {
            title: '资深法语教师',
            bio: '拥有10年法语教学经验，擅长口语和商务法语',
            subjects: JSON.stringify(['法语', '商务法语', '法语口语']),
            hourlyRate: 200,
            location: '北京',
            languages: JSON.stringify(['中文', '法语', '英语']),
            education: '巴黎索邦大学 法语文学硕士',
            experience: '10年',
            certificates: JSON.stringify(['法语教学资格证', 'DELF/DALF考官证']),
            isVerified: true,
            isActive: true,
            approvalStatus: 'APPROVED',
            totalStudents: 50,
            totalClasses: 500,
            rating: 4.8,
            reviewCount: 45,
          },
        },
      },
      include: {
        teacher: true,
      },
    })
    console.log('创建教师1:', teacher1.name)
  } else {
    console.log('教师1已存在:', teacher1.name)
  }

  // 检查并创建教师2
  let teacher2 = await prisma.user.findUnique({
    where: { email: 'teacher2@talkyone.com' },
    include: { teacher: true },
  })

  if (!teacher2) {
    teacher2 = await prisma.user.create({
      data: {
        email: 'teacher2@talkyone.com',
        password: hashedPassword,
        name: 'John Smith',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
        role: 'TEACHER',
        teacher: {
          create: {
            title: '专业英语外教',
            bio: 'Native English speaker with 8 years of teaching experience',
            subjects: JSON.stringify(['英语', '商务英语', '雅思']),
            hourlyRate: 250,
            location: '上海',
            languages: JSON.stringify(['英语', '中文']),
            education: 'University of Cambridge TESOL',
            experience: '8年',
            certificates: JSON.stringify(['TEFL', 'CELTA']),
            isVerified: true,
            isActive: true,
            approvalStatus: 'APPROVED',
            totalStudents: 80,
            totalClasses: 800,
            rating: 4.9,
            reviewCount: 72,
          },
        },
      },
      include: {
        teacher: true,
      },
    })
    console.log('创建教师2:', teacher2.name)
  } else {
    console.log('教师2已存在:', teacher2.name)
  }

  // 检查并创建课时包1
  let package1 = await prisma.package.findFirst({
    where: { title: '法语零基础入门包' },
  })

  if (!package1) {
    package1 = await prisma.package.create({
      data: {
        teacherId: teacher1.teacher!.id,
        title: '法语零基础入门包',
        description: '适合完全没有法语基础的学员，从发音到简单对话',
        subjects: JSON.stringify(['法语']),
        totalHours: 20,
        price: 3500,
        isActive: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3个月后
      },
    })
    console.log('创建课时包1:', package1.title)
  } else {
    console.log('课时包1已存在:', package1.title)
  }

  // 检查并创建课时包2
  let package2 = await prisma.package.findFirst({
    where: { title: '雅思口语冲刺班' },
  })

  if (!package2) {
    package2 = await prisma.package.create({
      data: {
        teacherId: teacher2.teacher!.id,
        title: '雅思口语冲刺班',
        description: '针对雅思口语考试的高分冲刺课程',
        subjects: JSON.stringify(['英语', '雅思']),
        totalHours: 15,
        price: 4000,
        isActive: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 2个月后
      },
    })
    console.log('创建课时包2:', package2.title)
  } else {
    console.log('课时包2已存在:', package2.title)
  }

  // 检查并创建学生用户
  let student1 = await prisma.user.findUnique({
    where: { email: 'student1@talkyone.com' },
  })

  if (!student1) {
    student1 = await prisma.user.create({
      data: {
        email: 'student1@talkyone.com',
        password: hashedPassword,
        name: '张三',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhangSan',
        role: 'STUDENT',
        student: {
          create: {
            level: '零基础',
            goals: JSON.stringify(['旅游', '工作']),
            interests: JSON.stringify(['文化', '美食']),
          },
        },
      },
    })
    console.log('创建学生1:', student1.name)
  } else {
    console.log('学生1已存在:', student1.name)
  }

  // 创建更多测试教师（用于测试分页）
  const additionalTeachers = [
    {
      name: 'Emma Wilson',
      email: 'emma@talkyone.com',
      title: '剑桥认证英语教师',
      subjects: ['英语', '雅思', '商务英语'],
      location: '北京',
      hourlyRate: 220,
      rating: 4.9,
      reviewCount: 156,
      totalStudents: 120,
      totalClasses: 1200,
    },
    {
      name: 'Hiroshi Tanaka',
      email: 'hiroshi@talkyone.com',
      title: '日语母语教师',
      subjects: ['日语', '日语能力考'],
      location: '上海',
      hourlyRate: 180,
      rating: 4.7,
      reviewCount: 89,
      totalStudents: 65,
      totalClasses: 650,
    },
    {
      name: 'María García',
      email: 'maria@talkyone.com',
      title: '西班牙语母语教师',
      subjects: ['西班牙语', 'DELE考试'],
      location: '广州',
      hourlyRate: 160,
      rating: 4.8,
      reviewCount: 112,
      totalStudents: 88,
      totalClasses: 880,
    },
    {
      name: '张律师',
      email: 'lawyer.zhang@talkyone.com',
      title: '资深法律顾问',
      subjects: ['法律咨询', '合同法'],
      location: '北京',
      hourlyRate: 500,
      rating: 4.9,
      reviewCount: 67,
      totalStudents: 45,
      totalClasses: 450,
    },
    {
      name: 'Sophie Martin',
      email: 'sophie@talkyone.com',
      title: '法语DELF考官',
      subjects: ['法语', 'DELF/DALF'],
      location: '在线',
      hourlyRate: 230,
      rating: 4.6,
      reviewCount: 78,
      totalStudents: 55,
      totalClasses: 550,
    },
    {
      name: '李教授',
      email: 'li.prof@talkyone.com',
      title: '对外汉语专家',
      subjects: ['对外汉语', 'HSK考试'],
      location: '北京',
      hourlyRate: 200,
      rating: 4.8,
      reviewCount: 134,
      totalStudents: 100,
      totalClasses: 1000,
    },
    {
      name: 'Michael Brown',
      email: 'michael@talkyone.com',
      title: '美式英语口语专家',
      subjects: ['英语', '英语口语'],
      location: '上海',
      hourlyRate: 240,
      rating: 4.5,
      reviewCount: 92,
      totalStudents: 70,
      totalClasses: 700,
    },
    {
      name: 'Yuki Sato',
      email: 'yuki@talkyone.com',
      title: '日语JLPT辅导老师',
      subjects: ['日语', 'JLPT'],
      location: '在线',
      hourlyRate: 170,
      rating: 4.7,
      reviewCount: 76,
      totalStudents: 58,
      totalClasses: 580,
    },
    {
      name: 'Carlos Rodríguez',
      email: 'carlos@talkyone.com',
      title: '拉美西班牙语教师',
      subjects: ['西班牙语', '商务西班牙语'],
      location: '深圳',
      hourlyRate: 175,
      rating: 4.6,
      reviewCount: 85,
      totalStudents: 62,
      totalClasses: 620,
    },
    {
      name: '王律师',
      email: 'lawyer.wang@talkyone.com',
      title: '知识产权法律专家',
      subjects: ['法律咨询', '知识产权'],
      location: '北京',
      hourlyRate: 480,
      rating: 4.8,
      reviewCount: 54,
      totalStudents: 38,
      totalClasses: 380,
    },
    {
      name: 'Anna Müller',
      email: 'anna@talkyone.com',
      title: '德语母语教师',
      subjects: ['德语', '德语考试'],
      location: '在线',
      hourlyRate: 210,
      rating: 4.7,
      reviewCount: 98,
      totalStudents: 72,
      totalClasses: 720,
    },
    {
      name: 'James Wilson',
      email: 'james@talkyone.com',
      title: '商务英语专家',
      subjects: ['英语', '商务英语', '托福'],
      location: '深圳',
      hourlyRate: 260,
      rating: 4.8,
      reviewCount: 145,
      totalStudents: 110,
      totalClasses: 1100,
    },
  ]

  for (const teacherData of additionalTeachers) {
    let teacher = await prisma.user.findUnique({
      where: { email: teacherData.email },
      include: { teacher: true },
    })

    if (!teacher) {
      teacher = await prisma.user.create({
        data: {
          email: teacherData.email,
          password: hashedPassword,
          name: teacherData.name,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${teacherData.name.replace(' ', '')}`,
          role: 'TEACHER',
          teacher: {
            create: {
              title: teacherData.title,
              bio: `专业${teacherData.subjects[0]}教师，拥有丰富教学经验`,
              subjects: JSON.stringify(teacherData.subjects),
              hourlyRate: teacherData.hourlyRate,
              location: teacherData.location,
              languages: JSON.stringify(['中文', teacherData.subjects[0]]),
              education: '知名大学硕士',
              experience: '5-10年',
              certificates: JSON.stringify(['教师资格证书']),
              isVerified: true,
              isActive: true,
              approvalStatus: 'APPROVED',
              totalStudents: teacherData.totalStudents,
              totalClasses: teacherData.totalClasses,
              rating: teacherData.rating,
              reviewCount: teacherData.reviewCount,
            },
          },
        },
        include: { teacher: true },
      })
      console.log('创建教师:', teacher.name)
    } else {
      console.log('教师已存在:', teacher.name)
    }

    // 为该教师创建课时包
    const existingPackage = await prisma.package.findFirst({
      where: { teacherId: teacher.teacher!.id },
    })

    if (!existingPackage) {
      await prisma.package.create({
        data: {
          teacherId: teacher.teacher!.id,
          title: `${teacherData.subjects[0]}入门课程`,
          description: `适合初学者的${teacherData.subjects[0]}课程`,
          subjects: JSON.stringify(teacherData.subjects),
          totalHours: 20,
          price: teacherData.hourlyRate * 20,
          isActive: true,
          startDate: new Date(),
          endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        },
      })
      console.log(`  创建课时包: ${teacherData.subjects[0]}入门课程`)
    }
  }

  console.log('测试数据创建完成！')
}

main()
  .catch((e) => {
    console.error('创建测试数据失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
