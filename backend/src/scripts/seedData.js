import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/database.js';
import User from '../models/User.js';
import Client from '../models/Client.js';

// Load environment variables
dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@unisysinfotech.com',
      password: 'password123',
      role: 'admin',
      designation: 'Administrator',
      department: 'Management',
      isActive: true
    });

    await adminUser.save();
    console.log('✓ Admin user created');

    // Create sample users
    const sampleUsers = [
      {
        name: 'John Developer',
        email: 'john.dev@unisysinfotech.com',
        password: 'password123',
        role: 'user',
        designation: 'Senior Software Engineer',
        department: 'Engineering'
      },
      {
        name: 'Sarah QA',
        email: 'sarah.qa@unisysinfotech.com',
        password: 'password123',
        role: 'user',
        designation: 'QA Engineer',
        department: 'Quality Assurance'
      },
      {
        name: 'Mike DevOps',
        email: 'mike.devops@unisysinfotech.com',
        password: 'password123',
        role: 'user',
        designation: 'DevOps Engineer',
        department: 'Infrastructure'
      }
    ];

    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
    }
    console.log('✓ Sample users created');

    // Create sample clients
    const sampleClients = [
      {
        name: 'Tech Solutions Inc',
        email: 'contact@techsolutions.com',
        industry: 'Technology',
        contactPerson: 'Robert Johnson',
        phone: '+1-555-0101',
        address: '123 Tech Street, San Francisco, CA 94102',
        status: 'active'
      },
      {
        name: 'Finance Plus LLC',
        email: 'info@financeplus.com',
        industry: 'Financial Services',
        contactPerson: 'Emma Smith',
        phone: '+1-555-0102',
        address: '456 Finance Ave, New York, NY 10001',
        status: 'active'
      },
      {
        name: 'HealthCare Digital',
        email: 'support@healthcaredigital.com',
        industry: 'Healthcare',
        contactPerson: 'Dr. Lisa Brown',
        phone: '+1-555-0103',
        address: '789 Medical Plaza, Boston, MA 02108',
        status: 'active'
      },
      {
        name: 'Retail Connect',
        email: 'hello@retailconnect.com',
        industry: 'Retail',
        contactPerson: 'David Wilson',
        phone: '+1-555-0104',
        address: '321 Commerce Blvd, Atlanta, GA 30303',
        status: 'active'
      }
    ];

    for (const clientData of sampleClients) {
      const client = new Client(clientData);
      await client.save();
    }
    console.log('✓ Sample clients created');

    console.log('\n✅ Database seeded successfully!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run seed
seedDatabase();
