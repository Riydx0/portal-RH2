import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoleEnum = pgEnum("user_role", ["admin", "client"]);
export const ticketStatusEnum = pgEnum("ticket_status", ["open", "in-progress", "closed"]);
export const ticketPriorityEnum = pgEnum("ticket_priority", ["low", "normal", "high"]);
export const licenseStatusEnum = pgEnum("license_status", ["available", "in-use", "expired"]);
export const platformEnum = pgEnum("platform", ["Windows", "Mac", "Both"]);
export const networkStatusEnum = pgEnum("network_status", ["active", "inactive", "maintenance", "error"]);
export const firewallStatusEnum = pgEnum("firewall_status", ["enabled", "disabled", "monitoring"]);

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  username: text("username").unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull().default("client"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const categories = pgTable("categories", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const software = pgTable("software", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  categoryId: integer("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
  description: text("description"),
  downloadUrl: text("download_url"),
  filePath: text("file_path"),
  fileSize: integer("file_size"),
  version: text("version"),
  platform: platformEnum("platform").notNull().default("Both"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const licenses = pgTable("licenses", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  softwareId: integer("software_id").notNull().references(() => software.id, { onDelete: "cascade" }),
  licenseKey: text("license_key").notNull(),
  assignedTo: text("assigned_to"),
  notes: text("notes"),
  status: licenseStatusEnum("status").notNull().default("available"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const tickets = pgTable("tickets", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: ticketStatusEnum("status").notNull().default("open"),
  priority: ticketPriorityEnum("priority").notNull().default("normal"),
  createdBy: integer("created_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  assignedTo: integer("assigned_to").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const ticketComments = pgTable("ticket_comments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  ticketId: integer("ticket_id").notNull().references(() => tickets.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const clients = pgTable("clients", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  company: text("company"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const devices = pgTable("devices", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  deviceName: text("device_name").notNull(),
  serialNumber: text("serial_number"),
  model: text("model"),
  manufacturer: text("manufacturer"),
  clientId: integer("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  key: text("key").notNull().unique(),
  value: text("value"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const externalLinks = pgTable("external_links", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  description: text("description"),
  icon: text("icon"),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  relatedId: integer("related_id"),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const shareLinks = pgTable("share_links", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  softwareId: integer("software_id").notNull().references(() => software.id, { onDelete: "cascade" }),
  secretCode: text("secret_code").notNull().unique(),
  createdBy: integer("created_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
});

export const groups = pgTable("groups", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const userGroups = pgTable("user_groups", {
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  groupId: integer("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const networks = pgTable("networks", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull().unique(),
  description: text("description"),
  ipRange: text("ip_range").notNull(),
  gateway: text("gateway"),
  dns: text("dns"),
  status: networkStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const vpnConfigs = pgTable("vpn_configs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull().unique(),
  description: text("description"),
  protocol: text("protocol").notNull(), // OpenVPN, WireGuard, IPSec, etc
  serverAddress: text("server_address").notNull(),
  port: integer("port").notNull(),
  username: text("username"),
  password: text("password"),
  certificate: text("certificate"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const firewallRules = pgTable("firewall_rules", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  description: text("description"),
  action: text("action").notNull(), // allow, deny, log
  sourceIp: text("source_ip"),
  destinationIp: text("destination_ip"),
  port: text("port"),
  protocol: text("protocol"), // TCP, UDP, ICMP, etc
  priority: integer("priority").notNull().default(100),
  isEnabled: boolean("is_enabled").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Schemas & Types
export const insertNetworkSchema = createInsertSchema(networks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVpnConfigSchema = createInsertSchema(vpnConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFirewallRuleSchema = createInsertSchema(firewallRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const usersRelations = relations(users, ({ many }) => ({
  createdTickets: many(tickets, { relationName: "createdBy" }),
  assignedTickets: many(tickets, { relationName: "assignedTo" }),
  ticketComments: many(ticketComments),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  software: many(software),
}));

export const softwareRelations = relations(software, ({ one, many }) => ({
  category: one(categories, {
    fields: [software.categoryId],
    references: [categories.id],
  }),
  licenses: many(licenses),
}));

export const licensesRelations = relations(licenses, ({ one }) => ({
  software: one(software, {
    fields: [licenses.softwareId],
    references: [software.id],
  }),
}));

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  creator: one(users, {
    fields: [tickets.createdBy],
    references: [users.id],
    relationName: "createdBy",
  }),
  assignee: one(users, {
    fields: [tickets.assignedTo],
    references: [users.id],
    relationName: "assignedTo",
  }),
  comments: many(ticketComments),
}));

export const ticketCommentsRelations = relations(ticketComments, ({ one }) => ({
  ticket: one(tickets, {
    fields: [ticketComments.ticketId],
    references: [tickets.id],
  }),
  user: one(users, {
    fields: [ticketComments.userId],
    references: [users.id],
  }),
}));

// Types
export type Network = typeof networks.$inferSelect;
export type InsertNetwork = z.infer<typeof insertNetworkSchema>;

export type VpnConfig = typeof vpnConfigs.$inferSelect;
export type InsertVpnConfig = z.infer<typeof insertVpnConfigSchema>;

export type FirewallRule = typeof firewallRules.$inferSelect;
export type InsertFirewallRule = z.infer<typeof insertFirewallRuleSchema>;

export type User = typeof users.$inferSelect;
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Software = typeof software.$inferSelect;
export const insertSoftwareSchema = createInsertSchema(software).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSoftware = z.infer<typeof insertSoftwareSchema>;

export type License = typeof licenses.$inferSelect;
export const insertLicenseSchema = createInsertSchema(licenses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertLicense = z.infer<typeof insertLicenseSchema>;

export type Ticket = typeof tickets.$inferSelect;
export const insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertTicket = z.infer<typeof insertTicketSchema>;

export type TicketComment = typeof ticketComments.$inferSelect;
export const insertTicketCommentSchema = createInsertSchema(ticketComments).omit({
  id: true,
  createdAt: true,
});
export type InsertTicketComment = z.infer<typeof insertTicketCommentSchema>;

export type Client = typeof clients.$inferSelect;
export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Device = typeof devices.$inferSelect;
export const insertDeviceSchema = createInsertSchema(devices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertDevice = z.infer<typeof insertDeviceSchema>;

export type Setting = typeof settings.$inferSelect;
export const insertSettingSchema = createInsertSchema(settings).omit({
  id: true,
});
export type InsertSetting = z.infer<typeof insertSettingSchema>;

export type ExternalLink = typeof externalLinks.$inferSelect;
export const insertExternalLinkSchema = createInsertSchema(externalLinks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertExternalLink = z.infer<typeof insertExternalLinkSchema>;

export type Notification = typeof notifications.$inferSelect;
export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type ShareLink = typeof shareLinks.$inferSelect;
export const insertShareLinkSchema = createInsertSchema(shareLinks).omit({
  id: true,
  createdAt: true,
});
export type InsertShareLink = z.infer<typeof insertShareLinkSchema>;

export type Group = typeof groups.$inferSelect;
export const insertGroupSchema = createInsertSchema(groups).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertGroup = z.infer<typeof insertGroupSchema>;

export type UserGroup = typeof userGroups.$inferSelect;
export const insertUserGroupSchema = createInsertSchema(userGroups).omit({
  createdAt: true,
});
export type InsertUserGroup = z.infer<typeof insertUserGroupSchema>;
