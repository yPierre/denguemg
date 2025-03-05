import { NextResponse } from "next/server";
import clientPromise from "../../lib/mongodb";
import { adaptCityData } from "../../../utils/dataAdapter";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const cityName = searchParams.get("city");
        const client = await clientPromise;
        const db = client.db("denguemg");

        if (cityName) {
            return await getCityData(db, cityName);
        }

        return await getStateData(db);

    } catch (error) {
        console.error("Erro ao buscar dados:", error);
        return NextResponse.json(
            { error: "Erro interno ao processar a requisição" },
            { status: 500 }
        );
    }
}

// Função para buscar dados do estado (mantida igual)
async function getStateData(db) {
    const latestWeek = await db.collection("statev3")
        .find({}, {
            sort: { SE: -1 },
            limit: 1,
            projection: {
                cities: 1,
                total_week_cases: 1,
                cities_in_alert_state: 1,
                total_notif_accum_year: 1,
                SE: 1
            }
        })
        .toArray();

    if (!latestWeek?.length) {
        return NextResponse.json(
            { error: "Dados da última semana não encontrados" },
            { status: 404 }
        );
    }

    const historicalData = await db.collection("statev3")
        .find({}, {
            sort: { SE: 1 },
            projection: {
                _id: 0,
                SE: 1,
                total_week_cases: 1,
                cities_in_alert_state: 1,
                total_notif_accum_year: 1
            }
        })
        .toArray();

    const stateData = [latestWeek[0], ...historicalData];
    return NextResponse.json(stateData);
}

// Função corrigida para buscar dados da cidade
async function getCityData(db, cityName) {
    const cityHistory = await db.collection("statev3")
        .aggregate([
            { $unwind: "$cities" },
            { $match: { "cities.city": new RegExp(cityName, "i") } },
            { 
                $group: {
                    _id: "$SE",
                    SE: { $first: "$SE" },
                    cityData: { $first: "$cities" }
                }
            },
            { $sort: { SE: 1 } },
            { $project: { _id: 0, SE: 1, cityData: 1 } }
        ])
        .toArray();

    if (!cityHistory?.length) {
        return NextResponse.json(
            { error: `Dados não encontrados para: ${cityName}` },
            { status: 404 }
        );
    }

    // Formatação correta dos dados
    const formattedData = cityHistory.map(week => ({
        SE: week.SE,
        cities: [week.cityData]
    }));

    const adaptedData = adaptCityData(cityName, formattedData);
    return NextResponse.json(adaptedData);
}