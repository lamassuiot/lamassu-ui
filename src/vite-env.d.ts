/// <reference types="vite/client" />

declare module "react-color";
declare module "react-map-interaction" {
    import { FC, ReactNode, PropsWithChildren } from "react";

    type Translation = {
        x: number;
        y: number;
    };

    export type MapInteractionProps = {
        children?: ({
            scale,
            translation
        }: {
            scale: number;
            translation: Translation;
        }) => ReactNode;

        value?: {
            scale: number;
            translation: Translation;
        };

        defaultValue?: {
            scale: number;
            translation: Translation;
        };

        disableZoom?: boolean;
        disablePan?: boolean;

        translationBounds?: {
            xMin?: number;
            xMax?: number;
            yMin?: number;
            yMax?: number;
        };

        onChange?: ({
            scale,
            translation
        }: {
            scale: number;
            translation: Translation;
        }) => void;

        minScale?: number;
        maxScale?: number;

        showControls?: boolean;
        plusBtnContents?: ReactNode;
        minusBtnContents?: ReactNode;

        controlsClass?: string;
        btnClass?: string;
        plusBtnClass?: string;
        minusBtnClass?: string;
    };

    export const MapInteraction: FC<MapInteractionProps>;

    export type MapInteractionCSSProps = PropsWithChildren<
        Omit<MapInteractionProps, "children">
    >;

    export const MapInteractionCSS: FC<MapInteractionCSSProps>;

    export default MapInteraction;
}
