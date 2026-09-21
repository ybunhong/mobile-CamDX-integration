import { styles } from "@/styles/glassStyles";
import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

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

interface PokemonCardProps {
  pokemon: Pokemon;
}

export default function PokemonCard({ pokemon }: PokemonCardProps) {
  const router = useRouter();

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

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/pokemon/${pokemon.id}`)}
    >
      <Image
        source={{ uri: pokemon.sprites.other["official-artwork"].front_default || pokemon.sprites.front_default }}
        style={styles.cardImage}
      />
      <Text style={styles.cardName}>
        #{pokemon.id} {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
      </Text>
      <View style={styles.cardTypes}>
        {pokemon.types.map((type) => (
          <View
            key={type.type.name}
            style={[styles.typeBadge, { backgroundColor: getTypeColor(type.type.name) }]}
          >
            <Text style={styles.typeText}>{type.type.name.toUpperCase()}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}
