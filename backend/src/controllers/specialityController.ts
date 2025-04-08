import { Request, Response } from "express";
import Speciality from "../models/speciality";
import { HttpMessage, HttpStatus } from "../enums/HttpStatus";

class SpecialityController {

    async specialityStatus(req: Request, res: Response): Promise<void> {
        try {
            const { name } = req.query;
            if (!name){
                res.status(HttpStatus.BAD_REQUEST).json({ error: "Speciality name is required" }) 
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
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: HttpMessage.INTERNAL_SERVER_ERROR });
          }
        };


    
    async addSpeciality(req: Request, res: Response): Promise<void> {
        const { name } = req.body;

        if (!name) {
            res.status(HttpStatus.BAD_REQUEST).json({ message:HttpMessage.BAD_REQUEST });
            return;
        }

        try {
            const existingSpeciality = await Speciality.findOne({ name });
            if (existingSpeciality) {
                res.status(HttpStatus.BAD_REQUEST).json({ message: HttpMessage.BAD_REQUEST });
                return;
            }

            const speciality = new Speciality({ name });
            await speciality.save();

            res.status(HttpStatus.CREATED).json({ message:HttpMessage.CREATED});
        } catch (error) {
            console.error(error)
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: HttpMessage.INTERNAL_SERVER_ERROR });
        }
    }


    async getAllSpecialities(req: Request, res: Response) {
        try {
            const specialities = await Speciality.find();
            res.status(HttpStatus.OK).json(specialities);
        } catch (error) {
            console.log("error getting speciality:",error)
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: HttpMessage.INTERNAL_SERVER_ERROR });
        }
    }


    async toggleSpecialityStatus(req: Request, res: Response): Promise<void> {
        const { id } = req.params;

        try {
            const speciality = await Speciality.findById(id);

            if (!speciality) {
                res.status(HttpStatus.NOT_FOUND).json({ message: HttpMessage.NOT_FOUND });
                return 
            }

            speciality.isActive = !speciality.isActive; 
            await speciality.save();

            res.status(HttpStatus.OK).json(speciality);
        } catch (error) {
            console.log("error toggling speciality:",error)
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: HttpMessage.INTERNAL_SERVER_ERROR });
        }
    }

}

export default new SpecialityController();
