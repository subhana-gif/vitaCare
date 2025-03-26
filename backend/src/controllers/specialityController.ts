import { Request, Response } from "express";
import Speciality from "../models/speciality";

class SpecialityController {

    async specialityStatus(req: Request, res: Response): Promise<void> {
        try {
            const { name } = req.query;
            if (!name){
                res.status(400).json({ error: "Speciality name is required" }) 
                 return
            }
            const speciality = await Speciality.findOne({ name });
            if (!speciality) {
             res.json({ isActive: false });
             return 
            }                    
            res.json({ isActive: speciality.isActive });
          } catch (error) {
            console.error("Error checking speciality status:", error);
            res.status(500).json({ error: "Internal Server Error" });
          }
        };


    
    async addSpeciality(req: Request, res: Response): Promise<void> {
        const { name } = req.body;

        if (!name) {
            res.status(400).json({ message: "Speciality name is required." });
            return;
        }

        try {
            const existingSpeciality = await Speciality.findOne({ name });
            if (existingSpeciality) {
                res.status(400).json({ message: "Speciality already exists." });
                return;
            }

            const speciality = new Speciality({ name });
            await speciality.save();

            res.status(201).json({ message: "Speciality added successfully!", speciality });
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: "Error adding speciality.", error });
        }
    }


    async getAllSpecialities(req: Request, res: Response) {
        try {
            const specialities = await Speciality.find();
            res.status(200).json(specialities);
        } catch (error) {
            console.log("error getting speciality:",error)
            res.status(500).json({ message: "Failed to fetch specialities.", error });
        }
    }


    async toggleSpecialityStatus(req: Request, res: Response): Promise<void> {
        const { id } = req.params;

        try {
            const speciality = await Speciality.findById(id);

            if (!speciality) {
                res.status(404).json({ message: "Speciality not found." });
                return 
            }

            speciality.isActive = !speciality.isActive; 
            await speciality.save();

            res.status(200).json(speciality);
        } catch (error) {
            console.log("error toggling speciality:",error)
            res.status(500).json({ message: "Error toggling speciality status.", error });
        }
    }

}

export default new SpecialityController();
