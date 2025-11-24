import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, hashPassword } from "./auth";
import { db } from "./db";
import {
  insertUserSchema,
  insertCategorySchema,
  insertSoftwareSchema,
  insertLicenseSchema,
  insertTicketSchema,
  insertTicketCommentSchema,
} from "@shared/schema";

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

  const httpServer = createServer(app);

  return httpServer;
}
