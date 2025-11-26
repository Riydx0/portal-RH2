import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, hashPassword } from "./auth";
import { comparePasswords } from "./auth";
import { db } from "./db";
import multer from "multer";
import path from "path";
import fs from "fs";
import { z } from "zod";
import {
  insertUserSchema,
  insertCategorySchema,
  insertSoftwareSchema,
  insertLicenseSchema,
  insertTicketSchema,
  insertTicketCommentSchema,
  settings,
  externalLinks,
  notifications,
  shareLinks,
  groups,
  networks,
  vpnConfigs,
  firewallRules,
  insertExternalLinkSchema,
  insertShareLinkSchema,
  insertGroupSchema,
  insertNetworkSchema,
  insertVpnConfigSchema,
  insertFirewallRuleSchema,
  subscriptionPlans,
  subscriptions,
  invoices,
  softwarePricing,
  insertSubscriptionPlanSchema,
  insertSubscriptionSchema,
  insertInvoiceSchema,
  insertSoftwarePricingSchema,
  software,
  licenses,
  tickets,
  apiKeys,
  categories,
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const sanitizedName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, "_");
    const finalFilename = uniqueSuffix + "-" + sanitizedName;
    
    const finalPath = path.join(uploadsDir, finalFilename);
    const resolvedFinalPath = path.resolve(finalPath);
    const resolvedUploadsDir = path.resolve(uploadsDir);
    
    if (!resolvedFinalPath.startsWith(resolvedUploadsDir + path.sep)) {
      console.error(`[Security] Upload path traversal blocked: ${file.originalname}`);
      return cb(new Error("Invalid filename - path traversal detected"));
    }
    
    cb(null, finalFilename);
  },
});

const allowedExtensions = ['.exe', '.msi', '.zip', '.rar', '.7z', '.iso', '.dmg', '.pkg', '.deb', '.rpm', '.pdf', '.tar', '.gz', '.tar.gz'];

const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: (req, file, cb) => {
    const originalName = file.originalname.toLowerCase();
    const ext = path.extname(originalName);
    
    const isAllowed = allowedExtensions.some(allowedExt => originalName.endsWith(allowedExt));
    
    if (isAllowed) {
      cb(null, true);
    } else {
      console.warn(`[Security] File upload blocked - invalid extension: ${file.originalname}`);
      cb(new Error(`File type not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`));
    }
  },
});

function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.sendStatus(401);
  }
  next();
}

function requireAdmin(req: any, res: any, next: any) {
  if (!req.isAuthenticated() || req.user?.role !== "admin") {
    return res.sendStatus(403);
  }
  next();
}

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  app.post("/api/upload", requireAdmin, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).send("No file uploaded");
      }
      res.json({
        filename: req.file.filename,
        originalname: req.file.originalname,
        path: `/api/download/${req.file.filename}`,
        size: req.file.size,
      });
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.get("/api/download/:filename", requireAuth, (req, res) => {
    try {
      const filename = req.params.filename;
      
      if (!filename || filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
        console.warn(`[Security] Path traversal attempt blocked: ${filename}`);
        return res.status(400).send("Invalid filename");
      }
      
      const resolvedUploadsDir = path.resolve(uploadsDir);
      const filePath = path.join(resolvedUploadsDir, filename);
      const resolvedPath = path.resolve(filePath);
      
      const relativePath = path.relative(resolvedUploadsDir, resolvedPath);
      if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
        console.warn(`[Security] Path traversal attempt blocked: ${filename} -> ${relativePath}`);
        return res.status(400).send("Invalid file path");
      }
      
      if (!fs.existsSync(resolvedPath)) {
        return res.status(404).send("File not found");
      }
      
      res.download(resolvedPath);
    } catch (error: any) {
      console.error(`[Error] Download failed:`, error);
      res.status(500).send(error.message);
    }
  });

  app.get("/api/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.get("/api/users", requireAuth, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const sanitizedUsers = users.map(({ password, ...user }) => user);
      res.json(sanitizedUsers);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.post("/api/users", requireAdmin, async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      const hashedPassword = await hashPassword(data.password);
      const user = await storage.createUser({ ...data, password: hashedPassword });
      const { password, ...sanitizedUser } = user;
      res.status(201).json(sanitizedUser);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });

  app.patch("/api/users/:id", requireAdmin, async (req, res) => {
    try {
      const updateData = req.body;
      if (updateData.password) {
        updateData.password = await hashPassword(updateData.password);
      }
      const user = await storage.updateUser(parseInt(req.params.id), updateData);
      const { password, ...sanitizedUser } = user;
      res.json(sanitizedUser);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.delete("/api/users/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteUser(parseInt(req.params.id));
      res.sendStatus(204);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.get("/api/categories", requireAuth, async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.get("/api/categories/:id", requireAuth, async (req, res) => {
    try {
      const category = await storage.getCategoryById(parseInt(req.params.id));
      if (!category) {
        return res.status(404).send("Category not found");
      }
      res.json(category);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.post("/api/categories", requireAdmin, async (req, res) => {
    try {
      const data = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(data);
      res.status(201).json(category);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });

  app.patch("/api/categories/:id", requireAdmin, async (req, res) => {
    try {
      const category = await storage.updateCategory(
        parseInt(req.params.id),
        req.body
      );
      res.json(category);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.delete("/api/categories/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteCategory(parseInt(req.params.id));
      res.sendStatus(204);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.get("/api/software", requireAuth, async (req, res) => {
    try {
      const software = await db.query.software.findMany({
        with: {
          category: true,
        },
      });
      res.json(software);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.get("/api/software/:id", requireAuth, async (req, res) => {
    try {
      const sw = await db.query.software.findFirst({
        where: (software, { eq }) => eq(software.id, parseInt(req.params.id)),
        with: {
          category: true,
        },
      });
      if (!sw) {
        return res.status(404).send("Software not found");
      }
      res.json(sw);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.post("/api/software", requireAdmin, async (req, res) => {
    try {
      const { isShared, ...data } = req.body;
      const parsed = insertSoftwareSchema.parse(data);
      const sw = await storage.createSoftware(parsed);
      
      if (isShared) {
        const secretCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        await db.update(software)
          .set({ isShared: true, shareCode: secretCode })
          .where(eq(software.id, sw.id));
        
        await db.insert(shareLinks).values({
          softwareId: sw.id,
          secretCode,
          createdBy: req.user!.id,
          permissions: "download",
        });
        
        return res.status(201).json({ ...sw, isShared: true, shareCode: secretCode });
      }
      
      res.status(201).json(sw);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });

  app.patch("/api/software/:id", requireAdmin, async (req, res) => {
    try {
      const { isShared, ...data } = req.body;
      const id = parseInt(req.params.id);
      
      // Get original data first
      const original = await db.query.software.findFirst({
        where: (software, { eq }) => eq(software.id, id),
      });
      
      if (!original) {
        return res.status(404).send("Software not found");
      }
      
      // Prepare update data
      const updateData: any = { ...data };
      
      if (isShared !== undefined) {
        updateData.isShared = isShared;
        
        // Enable sharing: create share code if not exists
        if (isShared && !original.shareCode) {
          const secretCode = Math.random().toString(36).substring(2, 10).toUpperCase();
          updateData.shareCode = secretCode;
          
          await db.insert(shareLinks).values({
            softwareId: id,
            secretCode,
            createdBy: req.user!.id,
            permissions: "download",
          });
        } 
        // Disable sharing: remove share code
        else if (!isShared && original.shareCode) {
          updateData.shareCode = null;
          await db.delete(shareLinks).where(eq(shareLinks.secretCode, original.shareCode));
        }
      }
      
      // Update everything at once
      const updated = await db
        .update(software)
        .set(updateData)
        .where(eq(software.id, id))
        .returning();
      
      return res.json(updated[0]);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.delete("/api/software/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteSoftware(parseInt(req.params.id));
      res.sendStatus(204);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.get("/api/licenses", requireAuth, async (req, res) => {
    try {
      const licenses = await db.query.licenses.findMany({
        with: {
          software: true,
        },
      });
      res.json(licenses);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.get("/api/licenses/:id", requireAuth, async (req, res) => {
    try {
      const license = await db.query.licenses.findFirst({
        where: (licenses, { eq }) => eq(licenses.id, parseInt(req.params.id)),
        with: {
          software: true,
        },
      });
      if (!license) {
        return res.status(404).send("License not found");
      }
      res.json(license);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.post("/api/licenses", requireAdmin, async (req, res) => {
    try {
      const data = insertLicenseSchema.parse(req.body);
      const license = await storage.createLicense(data);
      res.status(201).json(license);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });

  app.patch("/api/licenses/:id", requireAdmin, async (req, res) => {
    try {
      const license = await storage.updateLicense(
        parseInt(req.params.id),
        req.body
      );
      res.json(license);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.delete("/api/licenses/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteLicense(parseInt(req.params.id));
      res.sendStatus(204);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.get("/api/tickets", requireAuth, async (req, res) => {
    try {
      const tickets = await db.query.tickets.findMany({
        with: {
          creator: true,
          assignee: true,
        },
      });
      const sanitized = tickets.map((t) => ({
        ...t,
        creator: { ...t.creator, password: undefined },
        assignee: t.assignee ? { ...t.assignee, password: undefined } : null,
      }));
      res.json(sanitized);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.get("/api/tickets/recent", requireAuth, async (req, res) => {
    try {
      const tickets = await storage.getRecentTickets(5);
      const ticketsWithCreator = await Promise.all(
        tickets.map(async (ticket) => {
          const creator = await storage.getUser(ticket.createdBy);
          return {
            ...ticket,
            creator: { ...creator!, password: undefined },
          };
        })
      );
      res.json(ticketsWithCreator);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.get("/api/tickets/:id", requireAuth, async (req, res) => {
    try {
      const ticket = await db.query.tickets.findFirst({
        where: (tickets, { eq }) => eq(tickets.id, parseInt(req.params.id)),
        with: {
          creator: true,
          assignee: true,
          comments: {
            with: {
              user: true,
            },
          },
        },
      });

      if (!ticket) {
        return res.status(404).send("Ticket not found");
      }

      const sanitized = {
        ...ticket,
        creator: { ...ticket.creator, password: undefined },
        assignee: ticket.assignee
          ? { ...ticket.assignee, password: undefined }
          : null,
        comments: ticket.comments.map((c) => ({
          ...c,
          user: { ...c.user, password: undefined },
        })),
      };

      res.json(sanitized);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.post("/api/tickets", requireAuth, async (req, res) => {
    try {
      const data = insertTicketSchema.parse(req.body);
      const ticket = await storage.createTicket(data);
      res.status(201).json(ticket);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });

  app.patch("/api/tickets/:id", requireAuth, async (req, res) => {
    try {
      const ticket = await storage.updateTicket(
        parseInt(req.params.id),
        req.body
      );
      res.json(ticket);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.delete("/api/tickets/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteTicket(parseInt(req.params.id));
      res.sendStatus(204);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.post("/api/ticket-comments", requireAuth, async (req, res) => {
    try {
      const data = insertTicketCommentSchema.parse(req.body);
      const comment = await storage.createTicketComment(data);
      res.status(201).json(comment);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });

  app.get("/api/settings", async (req, res) => {
    try {
      const result = await db.select().from(settings);
      const settingsMap: Record<string, string> = {};
      result.forEach((setting) => {
        settingsMap[setting.key] = setting.value || "";
      });
      res.json(settingsMap);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.get("/api/settings/:key", requireAdmin, async (req, res) => {
    try {
      const result = await db
        .select()
        .from(settings)
        .where(eq(settings.key, req.params.key))
        .limit(1);
      
      if (result.length === 0) {
        return res.status(404).send("Setting not found");
      }
      
      res.json(result[0]);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.patch("/api/settings/:key", requireAdmin, async (req, res) => {
    try {
      const updateSchema = z.object({
        value: z.string().max(1000).optional().nullable(),
      });
      
      const { value } = updateSchema.parse(req.body);
      const key = req.params.key;
      
      // First try to update, if nothing updated then insert
      const result = await db
        .update(settings)
        .set({ value: value || "", updatedAt: new Date() })
        .where(eq(settings.key, key))
        .returning();
      
      if (result.length === 0) {
        // If not found, insert it
        const insertResult = await db
          .insert(settings)
          .values({ key, value: value || "" })
          .returning();
        return res.json(insertResult[0]);
      }
      
      res.json(result[0]);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });

  // External Links
  app.get("/api/external-links", async (req, res) => {
    try {
      const links = await db.select().from(externalLinks).orderBy(externalLinks.order);
      res.json(links);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.post("/api/external-links", requireAdmin, async (req, res) => {
    try {
      const data = insertExternalLinkSchema.parse(req.body);
      const link = await db.insert(externalLinks).values(data).returning();
      res.status(201).json(link[0]);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });

  app.patch("/api/external-links/:id", requireAdmin, async (req, res) => {
    try {
      const data = insertExternalLinkSchema.partial().parse(req.body);
      const result = await db
        .update(externalLinks)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(externalLinks.id, parseInt(req.params.id)))
        .returning();
      
      if (result.length === 0) {
        return res.status(404).send("Link not found");
      }
      
      res.json(result[0]);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });

  app.delete("/api/external-links/:id", requireAdmin, async (req, res) => {
    try {
      await db.delete(externalLinks).where(eq(externalLinks.id, parseInt(req.params.id)));
      res.sendStatus(204);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  // Notifications
  app.get("/api/notifications", requireAuth, async (req, res) => {
    try {
      const notifs = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, req.user!.id))
        .orderBy((n) => n.createdAt);
      res.json(notifs);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.patch("/api/notifications/:id/read", requireAuth, async (req, res) => {
    try {
      const result = await db
        .update(notifications)
        .set({ read: true })
        .where(eq(notifications.id, parseInt(req.params.id)))
        .returning();
      
      if (result.length === 0) {
        return res.status(404).send("Notification not found");
      }
      
      res.json(result[0]);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  // Share Links
  app.post("/api/share-links", requireAuth, async (req, res) => {
    try {
      const { softwareId, password, note, expiresAt, permissions } = req.body;
      
      if (!softwareId) {
        return res.status(400).send("Software ID required");
      }

      // Generate random secret code (8 characters)
      const secretCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      const result = await db
        .insert(shareLinks)
        .values({
          softwareId,
          secretCode,
          createdBy: req.user!.id,
          password: password || null,
          note: note || null,
          permissions: permissions || "download",
          expiresAt: expiresAt ? new Date(expiresAt) : null,
        })
        .returning();
      
      res.status(201).json({
        ...result[0],
        shareUrl: `/download/${secretCode}`,
      });
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });

  app.get("/api/share-links/:softwareId", requireAdmin, async (req, res) => {
    try {
      const result = await db
        .select()
        .from(shareLinks)
        .where(eq(shareLinks.softwareId, parseInt(req.params.softwareId)));
      
      res.json(result.map(link => ({
        ...link,
        shareUrl: `/download/${link.secretCode}`,
      })));
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.delete("/api/share-links/:id", requireAdmin, async (req, res) => {
    try {
      await db.delete(shareLinks).where(eq(shareLinks.id, parseInt(req.params.id)));
      res.sendStatus(204);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.post("/api/share-download", async (req, res) => {
    try {
      const { secretCode, password } = req.body;
      
      if (!secretCode) {
        return res.status(400).send("Secret code required");
      }

      const [link] = await db
        .select()
        .from(shareLinks)
        .where(eq(shareLinks.secretCode, secretCode));
      
      if (!link) {
        return res.status(404).send("Invalid secret code");
      }

      // Check if expired
      if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
        return res.status(403).send("This link has expired");
      }

      // Check if password is required
      if (link.password && link.password !== password) {
        return res.status(401).json({ needsPassword: true, message: "Password required" });
      }

      // Get software details
      const [sw] = await db
        .select()
        .from(software)
        .where(eq(software.id, link.softwareId));
      
      if (!sw || !sw.filePath) {
        return res.status(404).send("File not found");
      }

      res.json({ 
        filePath: sw.filePath, 
        name: sw.name,
        note: link.note,
      });
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  // Groups
  app.get("/api/groups", requireAdmin, async (req, res) => {
    try {
      const result = await db.select().from(groups).orderBy(groups.name);
      res.json(result);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.post("/api/groups", requireAdmin, async (req, res) => {
    try {
      const data = insertGroupSchema.parse(req.body);
      const result = await db.insert(groups).values(data).returning();
      res.status(201).json(result[0]);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });

  app.patch("/api/groups/:id", requireAdmin, async (req, res) => {
    try {
      const data = insertGroupSchema.partial().parse(req.body);
      const result = await db
        .update(groups)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(groups.id, parseInt(req.params.id)))
        .returning();
      
      if (result.length === 0) {
        return res.status(404).send("Group not found");
      }
      
      res.json(result[0]);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });

  app.delete("/api/groups/:id", requireAdmin, async (req, res) => {
    try {
      await db.delete(groups).where(eq(groups.id, parseInt(req.params.id)));
      res.sendStatus(204);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  // Password Management
  app.post("/api/change-password", requireAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = req.user as any;

      if (!currentPassword || !newPassword) {
        return res.status(400).send("Current password and new password are required");
      }

      const currentUser = await storage.getUser(user.id);
      if (!currentUser) {
        return res.status(401).send("User not found");
      }

      const isPasswordCorrect = await comparePasswords(currentPassword, currentUser.password);
      if (!isPasswordCorrect) {
        return res.status(401).send("Current password is incorrect");
      }

      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUserPassword(user.id, hashedPassword);

      res.json({ success: true, message: "Password changed successfully" });
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  // Password reset endpoints
  const resetCodes = new Map<string, { code: string; expiresAt: number }>();

  app.post("/api/request-password-reset", async (req, res) => {
    try {
      const { email } = req.body;
      const user = await storage.getUserByEmail(email);

      if (!user) {
        // Don't reveal if email exists (security best practice)
        return res.json({ message: "If email exists, reset code sent" });
      }

      const resetCode = Math.random().toString().substring(2, 8);
      resetCodes.set(email, {
        code: resetCode,
        expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
      });

      // Send password reset email
      try {
        const { sendPasswordResetEmail } = await import("./email.js");
        await sendPasswordResetEmail(email, resetCode);
      } catch (emailError: any) {
        console.error("[Password Reset] Failed to send email:", emailError.message);
        // Don't fail the request, just log the error
        console.log(`[Password Reset] For testing, code is: ${resetCode}`);
      }

      res.json({ message: "Reset code sent to email" });
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.post("/api/verify-reset-code", (req, res) => {
    try {
      const { email, resetCode } = req.body;
      const stored = resetCodes.get(email);

      if (!stored || stored.expiresAt < Date.now()) {
        return res.status(400).send("Reset code expired or invalid");
      }

      if (stored.code !== resetCode) {
        return res.status(400).send("Invalid reset code");
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.post("/api/reset-password", async (req, res) => {
    try {
      const { email, resetCode, newPassword } = req.body;
      const stored = resetCodes.get(email);

      if (!stored || stored.expiresAt < Date.now()) {
        return res.status(400).send("Reset code expired");
      }

      if (stored.code !== resetCode) {
        return res.status(400).send("Invalid reset code");
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(400).send("User not found");
      }

      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUserPassword(user.id, hashedPassword);
      resetCodes.delete(email);

      res.json({ success: true, message: "Password reset successfully" });
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  // Networks endpoints
  app.get("/api/networks", requireAdmin, async (req, res) => {
    try {
      const allNetworks = await db.select().from(networks);
      res.json(allNetworks);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.post("/api/networks", requireAdmin, async (req, res) => {
    try {
      const data = insertNetworkSchema.parse(req.body);
      const created = await db.insert(networks).values(data).returning();
      res.json(created[0]);
      
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });

  app.delete("/api/networks/:id", requireAdmin, async (req, res) => {
    try {
      await db.delete(networks).where(eq(networks.id, parseInt(req.params.id)));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  // VPN endpoints
  app.get("/api/vpn", requireAdmin, async (req, res) => {
    try {
      const allVpn = await db.select().from(vpnConfigs);
      res.json(allVpn);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.post("/api/vpn", requireAdmin, async (req, res) => {
    try {
      const data = insertVpnConfigSchema.parse(req.body);
      const created = await db.insert(vpnConfigs).values(data).returning();
      res.json(created[0]);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });

  app.delete("/api/vpn/:id", requireAdmin, async (req, res) => {
    try {
      await db.delete(vpnConfigs).where(eq(vpnConfigs.id, parseInt(req.params.id)));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  // Firewall endpoints
  app.get("/api/firewall", requireAdmin, async (req, res) => {
    try {
      const allRules = await db.select().from(firewallRules);
      res.json(allRules);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.post("/api/firewall", requireAdmin, async (req, res) => {
    try {
      const data = insertFirewallRuleSchema.parse(req.body);
      const created = await db.insert(firewallRules).values(data).returning();
      res.json(created[0]);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });

  app.patch("/api/firewall/:id", requireAdmin, async (req, res) => {
    try {
      const updated = await db
        .update(firewallRules)
        .set(req.body)
        .where(eq(firewallRules.id, parseInt(req.params.id)))
        .returning();
      res.json(updated[0]);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });

  app.delete("/api/firewall/:id", requireAdmin, async (req, res) => {
    try {
      await db.delete(firewallRules).where(eq(firewallRules.id, parseInt(req.params.id)));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  // Subscription Plans endpoints
  app.get("/api/subscription-plans", async (req, res) => {
    try {
      const plans = await db.query.subscriptionPlans.findMany({
        where: (table) => eq(table.isActive, true),
        orderBy: (table) => [table.price],
      });
      res.json(plans);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  // User Subscriptions endpoints
  app.get("/api/subscriptions/me", requireAuth, async (req, res) => {
    try {
      const subscription = await db.query.subscriptions.findFirst({
        where: (table) => eq(table.userId, req.user!.id),
        with: {
          plan: true,
        },
      });
      res.json(subscription || null);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.post("/api/subscriptions", requireAuth, async (req, res) => {
    try {
      const { planId } = insertSubscriptionSchema.parse(req.body);

      const plan = await db.query.subscriptionPlans.findFirst({
        where: (table) => eq(table.id, planId),
      });

      if (!plan) {
        return res.status(404).json({ error: "Plan not found" });
      }

      const existingSubscription = await db.query.subscriptions.findFirst({
        where: (table) => eq(table.userId, req.user!.id),
      });

      if (existingSubscription) {
        const updated = await db
          .update(subscriptions)
          .set({
            planId,
            status: "active",
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.userId, req.user!.id))
          .returning();

        return res.json(updated[0]);
      }

      const newSubscription = await db
        .insert(subscriptions)
        .values({
          userId: req.user!.id,
          planId,
          status: "active",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        })
        .returning();

      res.json(newSubscription[0]);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });

  app.post("/api/subscriptions/:id/cancel", requireAuth, async (req, res) => {
    try {
      const updated = await db
        .update(subscriptions)
        .set({
          status: "canceled",
          canceledAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, parseInt(req.params.id)))
        .returning();

      res.json(updated[0]);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  // Invoices endpoints
  app.get("/api/invoices", async (req, res) => {
    try {
      const allInvoices = await db.query.invoices.findMany({
        orderBy: (table) => [desc(table.createdAt)],
        limit: 100,
      });
      res.json(allInvoices);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.get("/api/invoices/my", requireAuth, async (req, res) => {
    try {
      const userInvoices = await db.query.invoices.findMany({
        where: (table) => eq(table.clientId, req.user!.id),
        orderBy: (table) => [desc(table.createdAt)],
      });
      res.json(userInvoices);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.get("/api/invoices/:id", async (req, res) => {
    try {
      const invoice = await db.query.invoices.findFirst({
        where: (table) => eq(table.id, parseInt(req.params.id)),
      });

      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      res.json(invoice);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  // Software Pricing endpoints
  app.get("/api/software-pricing", async (req, res) => {
    try {
      const pricing = await db.query.softwarePricing.findMany({
        where: (table) => eq(table.isActive, true),
      });
      res.json(pricing);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.get("/api/software-pricing/software/:softwareId", async (req, res) => {
    try {
      const pricing = await db.query.softwarePricing.findMany({
        where: (table) => eq(table.softwareId, parseInt(req.params.softwareId)),
      });
      res.json(pricing);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.post("/api/software-pricing", requireAdmin, async (req, res) => {
    try {
      const data = insertSoftwarePricingSchema.parse(req.body);
      const created = await db.insert(softwarePricing).values(data).returning();
      res.json(created[0]);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });

  app.delete("/api/software-pricing/:id", requireAdmin, async (req, res) => {
    try {
      await db
        .delete(softwarePricing)
        .where(eq(softwarePricing.id, parseInt(req.params.id)));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  // Subscription Plans CRUD
  app.post("/api/subscription-plans", requireAdmin, async (req, res) => {
    try {
      const data = insertSubscriptionPlanSchema.parse(req.body);
      const created = await db
        .insert(subscriptionPlans)
        .values(data)
        .returning();
      res.json(created[0]);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });

  app.patch("/api/subscription-plans/:id", requireAdmin, async (req, res) => {
    try {
      const updated = await db
        .update(subscriptionPlans)
        .set(req.body)
        .where(eq(subscriptionPlans.id, parseInt(req.params.id)))
        .returning();
      res.json(updated[0]);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });

  app.delete("/api/subscription-plans/:id", requireAdmin, async (req, res) => {
    try {
      await db
        .delete(subscriptionPlans)
        .where(eq(subscriptionPlans.id, parseInt(req.params.id)));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  // Email test endpoint
  app.post("/api/settings/test-email", requireAdmin, async (req, res) => {
    try {
      const { testEmail, customHtml, featureName, attachments } = req.body;
      const { sendWelcomeEmail, sendCustomEmailWithAttachments } = await import("./email.js");
      
      if (customHtml && featureName) {
        // Send custom email with attachments
        const processedAttachments = attachments?.map((att: any) => ({
          filename: att.filename || att.name,
          content: att.content || att.data,
        })) || [];
        
        await sendCustomEmailWithAttachments(
          testEmail,
          `Test Email: ${featureName}`,
          customHtml,
          processedAttachments
        );
      } else {
        // Send default welcome email
        await sendWelcomeEmail(testEmail, "Test User");
      }
      
      res.json({ success: true, message: "Test email sent successfully" });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || "Failed to send test email",
      });
    }
  });

  // Client endpoints for tickets
  app.post("/api/tickets", requireAuth, async (req, res) => {
    try {
      let { title, description, priority } = req.body;
      
      console.log("[Ticket] Received data:", { title, description, priority, userId: req.user.id });
      
      // Normalize priority
      priority = priority || "normal";
      
      // Ensure values are trimmed strings
      title = String(title || "").trim();
      description = String(description || "").trim();
      priority = String(priority || "normal").trim().toLowerCase();
      
      console.log("[Ticket] After normalization:", { title, description, priority });
      
      if (!title) {
        console.log("[Ticket] Title is empty");
        return res.status(400).send("Title is required");
      }
      if (!description) {
        console.log("[Ticket] Description is empty");
        return res.status(400).send("Description is required");
      }
      
      const validPriorities = ["low", "normal", "high"];
      if (!validPriorities.includes(priority)) {
        console.log("[Ticket] Invalid priority:", priority);
        priority = "normal";
      }

      console.log("[Ticket] Inserting into DB with:", { title, description, priority, createdBy: req.user.id });
      
      const ticket = await db.insert(tickets).values({
        title,
        description,
        priority: priority as any,
        createdBy: req.user.id,
        status: "open",
      }).returning();
      
      console.log("[Ticket] Created successfully:", ticket[0]);
      res.status(201).json(ticket[0]);
    } catch (error: any) {
      console.error("[Ticket] Error:", error);
      console.error("[Ticket] Error message:", error.message);
      console.error("[Ticket] Error stack:", error.stack);
      res.status(500).send(error.message || "Failed to create ticket");
    }
  });

  app.get("/api/my-tickets", requireAuth, async (req, res) => {
    try {
      const userTickets = await db.query.tickets.findMany({
        where: (table) => eq(table.createdBy, req.user.id),
      });
      res.json(userTickets);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  // Client endpoints for license requests
  app.post("/api/license-requests", requireAuth, async (req, res) => {
    try {
      const { softwareId } = req.body;
      const license = await db.insert(licenses).values({
        softwareId,
        licenseKey: "PENDING_" + Date.now(),
        assignedTo: req.user.email,
        status: "available",
      }).returning();
      res.status(201).json(license[0]);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });

  app.get("/api/my-licenses", requireAuth, async (req, res) => {
    try {
      const userLicenses = await db.query.licenses.findMany({
        where: (table) => eq(table.assignedTo, req.user.email),
      });
      res.json(userLicenses);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  // WireGuard endpoints
  app.post("/api/vpn/:id/generate-keys", requireAdmin, async (req, res) => {
    try {
      const { generateWireGuardPair } = await import("./wireguard.js");
      const keys = await generateWireGuardPair();
      res.json(keys);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.post("/api/vpn/:id/generate-config", requireAdmin, async (req, res) => {
    try {
      const { serverName, privateKey, clientPublicKey } = req.body;
      const vpnId = parseInt(req.params.id);
      
      const vpnConfig = await db.query.vpnConfigs.findFirst({
        where: (table) => eq(table.id, vpnId),
      });

      if (!vpnConfig) {
        return res.status(404).send("VPN configuration not found");
      }

      const { generateWireGuardConfig } = await import("./wireguard.js");
      const config = await generateWireGuardConfig(
        serverName || vpnConfig.name,
        vpnConfig.serverAddress,
        vpnConfig.port,
        vpnConfig.password || "",
        vpnConfig.certificate || "",
        undefined,
        clientPublicKey
      );

      res.json({ config });
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.post("/api/vpn/:id/generate-client-config", requireAdmin, async (req, res) => {
    try {
      const { clientPrivateKey, clientPublicKey, serverPublicKey } = req.body;
      const vpnId = parseInt(req.params.id);

      const vpnConfig = await db.query.vpnConfigs.findFirst({
        where: (table) => eq(table.id, vpnId),
      });

      if (!vpnConfig) {
        return res.status(404).send("VPN configuration not found");
      }

      const { generateClientConfig } = await import("./wireguard.js");
      const clientConfig = await generateClientConfig(
        clientPrivateKey,
        clientPublicKey,
        serverPublicKey,
        vpnConfig.serverAddress,
        vpnConfig.port
      );

      res.json({ config: clientConfig });
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.post("/api/vpn/:id/generate-qr", requireAdmin, async (req, res) => {
    try {
      const { config } = req.body;
      const { generateQRCode } = await import("./wireguard.js");
      const qrDataUrl = await generateQRCode(config);
      res.json({ qr: qrDataUrl });
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.get("/api/vpn/:id/download/:type", requireAdmin, async (req, res) => {
    try {
      const { config } = req.query;
      const { type } = req.params;

      if (!config || typeof config !== "string") {
        return res.status(400).send("Invalid config");
      }

      const filename = `wireguard-${type}-${Date.now()}.conf`;
      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(config);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  // API Keys Management (Developer API)
  app.get("/api/dev/keys", requireAuth, async (req, res) => {
    try {
      const keys = await db
        .select()
        .from(apiKeys)
        .where(eq(apiKeys.userId, req.user.id))
        .orderBy(desc(apiKeys.createdAt));
      
      res.json(keys.map(k => ({
        ...k,
        secret: undefined // Don't return secret on list
      })));
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.post("/api/dev/keys", requireAuth, async (req, res) => {
    try {
      const { name, rateLimit } = req.body;
      
      // Generate random key and secret
      const key = "sk_" + Math.random().toString(36).substring(2, 15);
      const secret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      const result = await db
        .insert(apiKeys)
        .values({
          key,
          secret,
          name,
          userId: req.user.id,
          rateLimit: rateLimit || 1000,
          permissions: ["read", "write"],
        })
        .returning();
      
      res.status(201).json(result[0]);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });

  app.delete("/api/dev/keys/:id", requireAuth, async (req, res) => {
    try {
      const keyId = parseInt(req.params.id);
      const apiKey = await db
        .select()
        .from(apiKeys)
        .where(eq(apiKeys.id, keyId))
        .limit(1);
      
      if (!apiKey.length || apiKey[0].userId !== req.user.id) {
        return res.status(403).send("Unauthorized");
      }
      
      await db.delete(apiKeys).where(eq(apiKeys.id, keyId));
      res.sendStatus(204);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.patch("/api/dev/keys/:id/toggle", requireAuth, async (req, res) => {
    try {
      const keyId = parseInt(req.params.id);
      const apiKey = await db
        .select()
        .from(apiKeys)
        .where(eq(apiKeys.id, keyId))
        .limit(1);
      
      if (!apiKey.length || apiKey[0].userId !== req.user.id) {
        return res.status(403).send("Unauthorized");
      }
      
      const result = await db
        .update(apiKeys)
        .set({ isActive: !apiKey[0].isActive })
        .where(eq(apiKeys.id, keyId))
        .returning();
      
      res.json(result[0]);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  // API Key Middleware
  async function validateApiKey(req: any, res: any, next: any) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid API key" });
    }
    
    const key = authHeader.substring(7);
    try {
      const apiKey = await db
        .select()
        .from(apiKeys)
        .where(eq(apiKeys.key, key))
        .limit(1);
      
      if (!apiKey.length || !apiKey[0].isActive) {
        return res.status(401).json({ error: "Invalid API key" });
      }
      
      if (apiKey[0].expiresAt && new Date(apiKey[0].expiresAt) < new Date()) {
        return res.status(401).json({ error: "API key expired" });
      }
      
      // Update last used timestamp
      await db
        .update(apiKeys)
        .set({ lastUsed: new Date() })
        .where(eq(apiKeys.id, apiKey[0].id));
      
      req.apiKey = apiKey[0];
      next();
    } catch (error: any) {
      res.status(401).json({ error: "Invalid API key" });
    }
  }

  // Public API Endpoints (require API key)
  app.get("/api/public/software", validateApiKey, async (req, res) => {
    try {
      const result = await db
        .select()
        .from(software)
        .where(eq(software.isActive, true));
      res.json(result);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.get("/api/public/categories", validateApiKey, async (req, res) => {
    try {
      const result = await db.select().from(categories);
      res.json(result);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.get("/api/public/licenses", validateApiKey, async (req, res) => {
    try {
      const result = await db.select().from(licenses);
      res.json(result);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.post("/api/public/share-download", validateApiKey, async (req, res) => {
    try {
      const { secretCode } = req.body;
      
      if (!secretCode) {
        return res.status(400).send("Secret code required");
      }

      const [link] = await db
        .select()
        .from(shareLinks)
        .where(eq(shareLinks.secretCode, secretCode));
      
      if (!link) {
        return res.status(404).send("Invalid secret code");
      }

      const [sw] = await db
        .select()
        .from(software)
        .where(eq(software.id, link.softwareId));
      
      if (!sw || !sw.filePath) {
        return res.status(404).send("File not found");
      }

      res.json({ filePath: sw.filePath, name: sw.name });
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  // Clients endpoints
  app.get("/api/clients", requireAdmin, async (req, res) => {
    try {
      const allClients = await storage.getAllClients();
      res.json(allClients);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.get("/api/clients/:id", requireAdmin, async (req, res) => {
    try {
      const client = await storage.getClientById(parseInt(req.params.id));
      if (!client) {
        return res.status(404).send("Client not found");
      }
      res.json(client);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.post("/api/clients", requireAdmin, async (req, res) => {
    try {
      const { name, company, email, phone, address, userId } = req.body;
      const client = await storage.createClient({
        name,
        company,
        email,
        phone,
        address,
        userId: userId || null,
      } as any);
      res.status(201).json(client);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });

  app.patch("/api/clients/:id", requireAdmin, async (req, res) => {
    try {
      const client = await storage.updateClient(parseInt(req.params.id), req.body);
      res.json(client);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.delete("/api/clients/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteClient(parseInt(req.params.id));
      res.sendStatus(204);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  // Devices endpoints
  app.get("/api/devices", requireAuth, async (req, res) => {
    try {
      const allDevices = await storage.getAllDevices();
      res.json(allDevices);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.get("/api/devices/client/:clientId", requireAdmin, async (req, res) => {
    try {
      const devices = await storage.getDevicesByClientId(parseInt(req.params.clientId));
      res.json(devices);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.get("/api/devices/:id", requireAuth, async (req, res) => {
    try {
      const device = await storage.getDeviceById(parseInt(req.params.id));
      if (!device) {
        return res.status(404).send("Device not found");
      }
      res.json(device);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.post("/api/devices", requireAdmin, async (req, res) => {
    try {
      const { deviceName, serialNumber, model, manufacturer, clientId } = req.body;
      const device = await storage.createDevice({
        deviceName,
        serialNumber,
        model,
        manufacturer,
        clientId,
      } as any);
      res.status(201).json(device);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });

  app.patch("/api/devices/:id", requireAdmin, async (req, res) => {
    try {
      const device = await storage.updateDevice(parseInt(req.params.id), req.body);
      res.json(device);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.delete("/api/devices/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteDevice(parseInt(req.params.id));
      res.sendStatus(204);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
