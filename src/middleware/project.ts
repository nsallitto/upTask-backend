import type { Request, Response, NextFunction } from "express";
import Project, { IProject } from "../models/Proyect";

//aqui creamos el req.project
declare global {
    namespace Express {
        interface Request {
            project: IProject
        }
    }
}

export async function projectExists(req: Request, res: Response, next: NextFunction) {
    //buscamos el proyecto por el id
    const { projectId } = req.params
    try {
        const project = await Project.findById(projectId)
        if (!project) {
            const error = new Error("Proyecto no encontrado")
            return res.status(404).json({ error: error.message })
        }

        //Validamos que el usuario autenticado sea el creador de proyecto
        if (req.user.id.toString() !== project.manager.toString() && !project.team.includes(req.user.id)) {
            const error = new Error("Acción no válida")
            return res.status(404).json({error: error.message})
        }

        //creamos req.project con project (lo hacemos con interface)
        req.project = project
        next()
    } catch (error) {
        res.status(500).json({ error: "hubo un error"})
    }
}