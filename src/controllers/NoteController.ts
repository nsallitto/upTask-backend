import { Request, Response } from "express"
import Note, { INote } from "../models/Note"
import { Types } from "mongoose"

type NoteParams = {
    noteId: Types.ObjectId
}

export class NoteController {
    //NUEVA NOTA
    static createNote = async (req: Request<{}, {}, INote>, res: Response) => { //--> Reques tiene 4 parametros, el 3ero es el req.body
        const { content } = req.body
        const note = new Note()
        
        note.content = content
        note.createdBy = req.user.id
        note.task = req.task.id

        req.task.notes.push(note.id)

        try {
            await Promise.allSettled([note.save(), req.task.save()])
            res.send("Nota creada correctamente")
        } catch (error) { 
            res.status(500).json({error: "Hubo un error"})
        }
    }

    //OBTENER TODAS LAS NOTAS
    static getAllNotes = async (req: Request, res: Response) => {
        try {
            const notes = await Note.find({task: req.task.id})
            res.json(notes)
            
        } catch (error) {
            res.status(500).json({error: "Hubo un error"})
        }
    }

    //ELIMINAMOS UNA NOTA
    static deleteNote = async (req: Request<NoteParams>, res: Response) => { //--> El primer parametro de req es el de req.params
        const { noteId } = req.params
        const note = await Note.findById(noteId)
        //validamos que la nota exista
        if(!note) {
            const error = new Error("Nota no encontrada")
            return res.status(404).json({error: error.message})
        }
        //validamos que el que quiera borrar la nota sea el que la creó
        if (note.createdBy.toString() !== req.user.id.toString()) {
            const error = new Error("Acción no válida")
            return res.status(401).json({error: error.message})
        }
        //quitamos la nota del array de tareas
        req.task.notes = req.task.notes.filter((noteId) => noteId.toString() !== note.id.toString())
        //borramos la nota
        try {
            await Promise.allSettled([note.deleteOne(), req.task.save()])
            res.send("Nota eliminada correctamente")
        } catch (error) {
            res.status(500).json({error: "Hubo un error"})
        }
    }
}