import { NextResponse } from "next/server";
import clientPromise from "../../lib/mongodb";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const cityName = searchParams.get("city"); // Obtém o parâmetro "city" da URL

        const client = await clientPromise;
        const db = client.db("denguemg");

        let query = {};
        if (cityName) {
            // Filtra os dados pelo nome da cidade (case-insensitive)
            query = { city: { $regex: new RegExp(cityName, "i") } };
        }

        const cities = await db.collection("citiesv3").find(query).toArray();

        return NextResponse.json(cities);
    } catch (error) {
        console.error("Erro ao buscar dados:", error);
        return NextResponse.json({ error: "Erro ao buscar cidades" }, { status: 500 });
    }
}