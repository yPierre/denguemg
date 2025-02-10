import { NextResponse } from "next/server";
import clientPromise from "../../lib/mongodb";

export async function GET() {
    try {
        console.log("Entrou no route!");
        const client = await clientPromise;
        const db = client.db("denguemg");
        const cities = await db.collection("citiesv3").find().toArray();

        return NextResponse.json(cities);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
        return NextResponse.json({ error: "Erro ao buscar cidades" }, { status: 500 });
    }
}
