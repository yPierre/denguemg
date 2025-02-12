import { NextResponse } from "next/server";
import clientPromise from "../../lib/mongodb"; // Ajuste o caminho conforme necessário

export async function GET() {
    try {
        console.log("Buscando dados do estado...");
        const client = await clientPromise;
        const db = client.db("denguemg");

        // Busca os dados agregados do estado
        const stateData = await db.collection("state").find().toArray();

        if (!stateData) {
            return NextResponse.json({ error: "Dados do estado não encontrados" }, { status: 404 });
        }

        return NextResponse.json(stateData);
    } catch (error) {
        console.error("Erro ao buscar dados do estado:", error);
        return NextResponse.json({ error: "Erro ao buscar dados do estado" }, { status: 500 });
    }
}
