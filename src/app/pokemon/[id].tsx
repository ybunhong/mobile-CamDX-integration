import { styles } from "@/styles/glassStyles";
import { useGlobalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

interface Pokemon {
  id: number;
  name: string;
  types: { type: { name: string } }[];
  stats: { stat: { name: string }; base_stat: number }[];
  abilities: { ability: { name: string } }[];
  height: number;
  weight: number;
  sprites: {
    front_default: string;
    other: {
      "official-artwork": {
        front_default: string;
      };
    };
  };
}

export default function PokemonDetail() {
  const router = useRouter();
  const params = useGlobalSearchParams();
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        const id = params.id;
        if (id) {
          const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
          const data = await response.json();
          setPokemon(data);
        }
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchPokemon();
  }, [params.id]);

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      normal: "#A8A77A",
      fire: "#EE8130",
      water: "#6390F0",
      electric: "#F7D02C",
      grass: "#7AC74C",
      ice: "#96D9D6",
      fighting: "#C22E28",
      poison: "#A33EA1",
      ground: "#E2BF65",
      flying: "#A98FF3",
      psychic: "#F95587",
      bug: "#A6B91A",
      rock: "#B6A136",
      ghost: "#735797",
      dragon: "#6F35FC",
      dark: "#705746",
      steel: "#B7B7CE",
      fairy: "#D685AD",
    };
    return colors[type] || "#777";
  };

  const formatStatName = (name: string) => {
    const names: Record<string, string> = {
      "hp": "HP",
      "attack": "ATK",
      "defense": "DEF",
      "special-attack": "SP.ATK",
      "special-defense": "SP.DEF",
      "speed": "SPD",
    };
    return names[name] || name.toUpperCase();
  };

  if (loading) {
    return (
      <View style={styles.detailContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!pokemon) {
    return (
      <View style={styles.detailContainer}>
        <Text style={styles.detailName}>Pokemon not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.detailContainer}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.detailCard}>
        <Image
          source={{ uri: pokemon.sprites.other["official-artwork"].front_default || pokemon.sprites.front_default }}
          style={styles.detailImage}
        />
        <Text style={styles.detailName}>
          #{pokemon.id} {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Types</Text>
          <View style={styles.detailTypes}>
            {pokemon.types.map((type) => (
              <View
                key={type.type.name}
                style={[styles.typeBadge, { backgroundColor: getTypeColor(type.type.name) }]}
              >
                <Text style={styles.typeText}>{type.type.name.toUpperCase()}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Physical</Text>
          <Text style={styles.sectionText}>Height: {pokemon.height / 10}m</Text>
          <Text style={styles.sectionText}>Weight: {pokemon.weight / 10}kg</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stats</Text>
          {pokemon.stats.map((stat) => (
            <Text key={stat.stat.name} style={styles.sectionText}>
              {formatStatName(stat.stat.name)}: {stat.base_stat}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Abilities</Text>
          {pokemon.abilities.map((ability) => (
            <Text key={ability.ability.name} style={styles.sectionText}>
              {ability.ability.name.replace("-", " ").toUpperCase()}
            </Text>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
