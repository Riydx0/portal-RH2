import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, hashPassword } from "./auth";
import { db } from "./db";
import multer from "multer";
import path from "path";
import fs from "fs";
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
  insertExternalLinkSchema,
} from "@shared/schema";
import { eq } from "drizzle-orm";

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
      const data = insertSoftwareSchema.parse(req.body);
      const sw = await storage.createSoftware(data);
      res.status(201).json(sw);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });

  app.patch("/api/software/:id", requireAdmin, async (req, res) => {
    try {
      const sw = await storage.updateSoftware(parseInt(req.params.id), req.body);
      res.json(sw);
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

  app.get("/api/settings", requireAdmin, async (req, res) => {
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

  const httpServer = createServer(app);

  return httpServer;
}
