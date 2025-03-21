import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { imageInfo } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  // The application primarily uses client-side processing
  // but we'll add API endpoints for Supabase integration
  
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Get compression history
  app.get('/api/compression-history', async (req, res) => {
    try {
      const historyItems = await storage.getCompressionHistory();
      res.json(historyItems);
    } catch (error) {
      console.error('Error fetching compression history:', error);
      res.status(500).json({ error: 'Failed to fetch compression history' });
    }
  });

  // Save compression result
  app.post('/api/compression-history', async (req, res) => {
    try {
      // Validate request body using the imageInfo schema
      const validationResult = imageInfo.safeParse(req.body.image_info);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Invalid image info', 
          details: validationResult.error.format() 
        });
      }
      
      const result = await storage.saveCompressionHistory(req.body.image_info);
      
      if (!result) {
        throw new Error('Failed to save compression history');
      }
      
      res.status(201).json(result);
    } catch (error) {
      console.error('Error saving compression history:', error);
      res.status(500).json({ error: 'Failed to save compression history' });
    }
  });

  // Delete compression history item
  app.delete('/api/compression-history/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCompressionHistory(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting compression history:', error);
      res.status(500).json({ error: 'Failed to delete compression history' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
