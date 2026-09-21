import PokemonCard from "@/components/PokemonCard";
import { styles } from "@/styles/glassStyles";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

interface Pokemon {
  id: number;
  name: string;
  types: { type: { name: string } }[];
  sprites: {
    front_default: string;
    other: {
      "official-artwork": {
        front_default: string;
      };
    };
  };
}

export default function Index() {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=10");
        const data = await response.json();
        
        const pokemonDetails = await Promise.all(
          data.results.map(async (poke: { url: string }) => {
            const res = await fetch(poke.url);
            return res.json();
          })
        );
        
        setPokemon(pokemonDetails);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchPokemon();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pokémon</Text>
      <FlatList
        data={pokemon}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <PokemonCard pokemon={item} />}
      />
    </View>
  );
}
