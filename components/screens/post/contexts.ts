import { createContext } from "react";
import { RootScreenProps } from "utils";
import { postGraph } from "jungle-shared";

export const PostGraphContext = createContext({} as postGraph);