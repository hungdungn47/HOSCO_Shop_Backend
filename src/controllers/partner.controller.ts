import { Request, Response } from "express";
import { PartnerService } from "../services/partner.service";

const partnerService = new PartnerService();

export class PartnerController {
  // Create a new partner
  async createPartner(req: Request, res: Response): Promise<any> {
    try {
      const partner = await partnerService.createPartner(req.body);
      return res.status(201).json({ message: "Created partner successfully!", partner });
    } catch (error) {
      return res.status(500).json({ message: "Failed to create partner", error: (error as Error).message });
    }
  }

  // Get all partners with pagination
  async getPartners(req: Request, res: Response): Promise<any> {
    try {
      const page = parseInt(req.query.page as string);
      const pageSize = parseInt(req.query.pageSize as string);
      const partners = await partnerService.getPartners(page, pageSize);
      return res.status(200).json({ message: "Fetched partners successfully!", ...partners });
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch partners", error: (error as Error).message });
    }
  }

  async searchPartners(req: Request, res: Response): Promise<any> {
    try {
      const query = req.query.q as string;
      const role = req.query.role as string;
      const page = parseInt(req.query.page as string);
      const pageSize = parseInt(req.query.pageSize as string);
      const partners = await partnerService.searchPartners(query, role, page, pageSize);
      return res.status(200).json({ message: "Fetched partners successfully!", ...partners });
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch partners", error: (error as Error).message });
    }
  }

  // Get a single partner by ID
  async getPartnerById(req: Request, res: Response): Promise<any> {
    try {
      const partner = await partnerService.getPartnerById(Number(req.params.id));
      if (!partner) {
        return res.status(404).json({ message: "Partner not found" });
      }
      return res.status(200).json({ message: "Fetched partner successfully!", partner });
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch partner", error: (error as Error).message });
    }
  }

  // Update a partner
  async updatePartner(req: Request, res: Response): Promise<any> {
    try {
      const updatedPartner = await partnerService.updatePartner(Number(req.params.id), req.body);
      if (!updatedPartner) {
        return res.status(404).json({ message: "Partner not found" });
      }
      return res.status(200).json({ message: "Partner updated successfully!", partner: updatedPartner });
    } catch (error) {
      return res.status(500).json({ message: "Failed to update partner", error: (error as Error).message });
    }
  }

  // Delete a partner
  async deletePartner(req: Request, res: Response): Promise<any> {
    try {
      const success = await partnerService.deletePartner(Number(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Partner not found" });
      }
      return res.status(200).json({ message: "Partner deleted successfully!" });
    } catch (error) {
      return res.status(500).json({ message: "Failed to delete partner", error: (error as Error).message });
    }
  }
}
