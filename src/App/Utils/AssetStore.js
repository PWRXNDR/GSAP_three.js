import { createStore } from "zustand/vanilla";

const assetsToLoad = [
  {
    id:'environment',
    path:'/models/environment.glb',
    type: 'model' 
    },
    {
        id: 'avatar',
        path: '/models/avatar.glb',
        type: 'model'
    },
    {
        id: 'pianoMusic',
        path: '/audio/pianoMusic.mp3',
        type: 'audio'
    }
];

const assetStore = createStore((set) => ({
  assetsToLoad,
  loadedAssets: {},
  addLoadedAsset: (asset, id) =>
    set((state) => ({
      loadedAssets: {
        ...state.loadedAssets,
        [id]: asset,
      },
    })),
}));

export default assetStore;
