import {
  users,
  categories,
  software,
  licenses,
  tickets,
  ticketComments,
  clients,
  devices,
  User,
  InsertUser,
  Category,
  InsertCategory,
  Software,
  InsertSoftware,
  License,
  InsertLicense,
  Ticket,
  InsertTicket,
  TicketComment,
  InsertTicketComment,
  Client,
  InsertClient,
  Device,
  InsertDevice,
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, desc, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: session.SessionStore;
  
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmailOrUsername(identifier: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User>;
  deleteUser(id: number): Promise<void>;
  updateUserPassword(id: number, hashedPassword: string): Promise<User>;
  getAllUsers(): Promise<User[]>;

  getAllCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, data: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;

  getAllSoftware(): Promise<Software[]>;
  getSoftwareById(id: number): Promise<Software | undefined>;
  createSoftware(software: InsertSoftware): Promise<Software>;
  updateSoftware(id: number, data: Partial<InsertSoftware> & { isShared?: boolean; shareCode?: string | null }): Promise<Software>;
  deleteSoftware(id: number): Promise<void>;

  getAllLicenses(): Promise<License[]>;
  getLicenseById(id: number): Promise<License | undefined>;
  createLicense(license: InsertLicense): Promise<License>;
  updateLicense(id: number, data: Partial<InsertLicense>): Promise<License>;
  deleteLicense(id: number): Promise<void>;

  getAllTickets(): Promise<Ticket[]>;
  getTicketById(id: number): Promise<Ticket | undefined>;
  getRecentTickets(limit: number): Promise<Ticket[]>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: number, data: Partial<InsertTicket>): Promise<Ticket>;
  deleteTicket(id: number): Promise<void>;

  getCommentsByTicketId(ticketId: number): Promise<TicketComment[]>;
  createTicketComment(comment: InsertTicketComment): Promise<TicketComment>;

  getAllClients(): Promise<Client[]>;
  getClientById(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, data: Partial<InsertClient>): Promise<Client>;
  deleteClient(id: number): Promise<void>;

  getDevicesByClientId(clientId: number): Promise<Device[]>;
  getDeviceById(id: number): Promise<Device | undefined>;
  getAllDevices(): Promise<Device[]>;
  createDevice(device: InsertDevice): Promise<Device>;
  updateDevice(id: number, data: Partial<InsertDevice>): Promise<Device>;
  deleteDevice(id: number): Promise<void>;

  getStats(): Promise<{
    totalSoftware: number;
    totalCategories: number;
    totalLicenses: number;
    availableLicenses: number;
    inUseLicenses: number;
    expiredLicenses: number;
    totalTickets: number;
    openTickets: number;
    inProgressTickets: number;
    closedTickets: number;
  }>;

  getSetting(key: string): Promise<string | undefined>;
  setSetting(key: string, value: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmailOrUsername(identifier: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(
      sql`${users.email} = ${identifier} OR ${users.username} = ${identifier}`
    );
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, createdAt: undefined, updatedAt: new Date() } as any)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async updateUserPassword(id: number, hashedPassword: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }

  async updateCategory(id: number, data: Partial<InsertCategory>): Promise<Category> {
    const [category] = await db
      .update(categories)
      .set({ ...data, createdAt: undefined } as any)
      .where(eq(categories.id, id))
      .returning();
    return category;
  }

  async deleteCategory(id: number): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  async getAllSoftware(): Promise<Software[]> {
    return await db.select().from(software).orderBy(software.name);
  }

  async getSoftwareById(id: number): Promise<Software | undefined> {
    const [sw] = await db.select().from(software).where(eq(software.id, id));
    return sw || undefined;
  }

  async createSoftware(insertSoftware: InsertSoftware): Promise<Software> {
    const [sw] = await db.insert(software).values(insertSoftware).returning();
    return sw;
  }

  async updateSoftware(id: number, data: Partial<InsertSoftware> & { isShared?: boolean; shareCode?: string | null }): Promise<Software> {
    const [sw] = await db
      .update(software)
      .set({ ...data, createdAt: undefined, updatedAt: new Date() } as any)
      .where(eq(software.id, id))
      .returning();
    return sw;
  }

  async deleteSoftware(id: number): Promise<void> {
    await db.delete(software).where(eq(software.id, id));
  }

  async getAllLicenses(): Promise<License[]> {
    return await db.select().from(licenses).orderBy(desc(licenses.createdAt));
  }

  async getLicenseById(id: number): Promise<License | undefined> {
    const [license] = await db.select().from(licenses).where(eq(licenses.id, id));
    return license || undefined;
  }

  async createLicense(insertLicense: InsertLicense): Promise<License> {
    const [license] = await db.insert(licenses).values(insertLicense).returning();
    return license;
  }

  async updateLicense(id: number, data: Partial<InsertLicense>): Promise<License> {
    const [license] = await db
      .update(licenses)
      .set({ ...data, createdAt: undefined, updatedAt: new Date() } as any)
      .where(eq(licenses.id, id))
      .returning();
    return license;
  }

  async deleteLicense(id: number): Promise<void> {
    await db.delete(licenses).where(eq(licenses.id, id));
  }

  async getAllTickets(): Promise<Ticket[]> {
    return await db.select().from(tickets).orderBy(desc(tickets.createdAt));
  }

  async getTicketById(id: number): Promise<Ticket | undefined> {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id));
    return ticket || undefined;
  }

  async getRecentTickets(limit: number): Promise<Ticket[]> {
    return await db
      .select()
      .from(tickets)
      .orderBy(desc(tickets.createdAt))
      .limit(limit);
  }

  async createTicket(insertTicket: InsertTicket): Promise<Ticket> {
    const [ticket] = await db.insert(tickets).values(insertTicket).returning();
    return ticket;
  }

  async updateTicket(id: number, data: Partial<InsertTicket>): Promise<Ticket> {
    const [ticket] = await db
      .update(tickets)
      .set({ ...data, createdAt: undefined, updatedAt: new Date() } as any)
      .where(eq(tickets.id, id))
      .returning();
    return ticket;
  }

  async deleteTicket(id: number): Promise<void> {
    await db.delete(tickets).where(eq(tickets.id, id));
  }

  async getCommentsByTicketId(ticketId: number): Promise<TicketComment[]> {
    return await db
      .select()
      .from(ticketComments)
      .where(eq(ticketComments.ticketId, ticketId))
      .orderBy(ticketComments.createdAt);
  }

  async createTicketComment(insertComment: InsertTicketComment): Promise<TicketComment> {
    const [comment] = await db.insert(ticketComments).values(insertComment).returning();
    return comment;
  }

  async getAllClients(): Promise<Client[]> {
    return await db.select().from(clients).orderBy(clients.name);
  }

  async getClientById(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db.insert(clients).values(insertClient).returning();
    return client;
  }

  async updateClient(id: number, data: Partial<InsertClient>): Promise<Client> {
    const [client] = await db
      .update(clients)
      .set({ ...data, createdAt: undefined, updatedAt: new Date() } as any)
      .where(eq(clients.id, id))
      .returning();
    return client;
  }

  async deleteClient(id: number): Promise<void> {
    await db.delete(clients).where(eq(clients.id, id));
  }

  async getDevicesByClientId(clientId: number): Promise<Device[]> {
    return await db
      .select()
      .from(devices)
      .where(eq(devices.clientId, clientId))
      .orderBy(devices.deviceName);
  }

  async getDeviceById(id: number): Promise<Device | undefined> {
    const [device] = await db.select().from(devices).where(eq(devices.id, id));
    return device || undefined;
  }

  async getAllDevices(): Promise<Device[]> {
    return await db.select().from(devices).orderBy(devices.deviceName);
  }

  async createDevice(insertDevice: InsertDevice): Promise<Device> {
    const [device] = await db.insert(devices).values(insertDevice).returning();
    return device;
  }

  async updateDevice(id: number, data: Partial<InsertDevice>): Promise<Device> {
    const [device] = await db
      .update(devices)
      .set({ ...data, createdAt: undefined, updatedAt: new Date() } as any)
      .where(eq(devices.id, id))
      .returning();
    return device;
  }

  async deleteDevice(id: number): Promise<void> {
    await db.delete(devices).where(eq(devices.id, id));
  }

  async getStats() {
    const [softwareCount] = await db.select({ count: sql<number>`count(*)::int` }).from(software);
    const [categoryCount] = await db.select({ count: sql<number>`count(*)::int` }).from(categories);
    const [licenseCount] = await db.select({ count: sql<number>`count(*)::int` }).from(licenses);
    const [availableLicenseCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(licenses)
      .where(eq(licenses.status, "available"));
    const [inUseLicenseCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(licenses)
      .where(eq(licenses.status, "in-use"));
    const [expiredLicenseCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(licenses)
      .where(eq(licenses.status, "expired"));
    const [ticketCount] = await db.select({ count: sql<number>`count(*)::int` }).from(tickets);
    const [openTicketCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tickets)
      .where(eq(tickets.status, "open"));
    const [inProgressTicketCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tickets)
      .where(eq(tickets.status, "in-progress"));
    const [closedTicketCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tickets)
      .where(eq(tickets.status, "closed"));

    return {
      totalSoftware: softwareCount.count,
      totalCategories: categoryCount.count,
      totalLicenses: licenseCount.count,
      availableLicenses: availableLicenseCount.count,
      inUseLicenses: inUseLicenseCount.count,
      expiredLicenses: expiredLicenseCount.count,
      totalTickets: ticketCount.count,
      openTickets: openTicketCount.count,
      inProgressTickets: inProgressTicketCount.count,
      closedTickets: closedTicketCount.count,
    };
  }

  async getSetting(key: string): Promise<string | undefined> {
    const [row] = await db.select().from(settings).where(eq(settings.key, key));
    return row?.value || undefined;
  }

  async setSetting(key: string, value: string): Promise<void> {
    const [existing] = await db.select().from(settings).where(eq(settings.key, key));
    if (existing) {
      await db.update(settings).set({ value, updatedAt: new Date() }).where(eq(settings.key, key));
    } else {
      await db.insert(settings).values({ key, value, createdAt: new Date(), updatedAt: new Date() });
    }
  }
}

export const storage = new DatabaseStorage();
