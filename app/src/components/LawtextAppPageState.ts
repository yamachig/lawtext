import React from "react";
import { LawData } from "@appsrc/lawdata/common";
import { useHistory } from "react-router";
import { useParams } from "react-router";

export interface BaseLawtextAppPageState {
    law: LawData | null;
    loadingLaw: boolean;
    viewerMessages: Record<string, string>;
    hasError: boolean;
    errors: Error[];
    navigatedLawSearchKey: string;
}

const getInitialState = (): BaseLawtextAppPageState => ({
    law: null,
    loadingLaw: false,
    viewerMessages: {},
    hasError: false,
    errors: [],
    navigatedLawSearchKey: "",
});
export type SetLawtextAppPageState = (newState: Partial<BaseLawtextAppPageState>) => void;
export type OrigSetLawtextAppPageState = React.Dispatch<React.SetStateAction<BaseLawtextAppPageState>>;

export interface LawtextAppPageStateStruct {
    origState: Readonly<BaseLawtextAppPageState>,
    origSetState: OrigSetLawtextAppPageState,
    setState: SetLawtextAppPageState,
    history: ReturnType<typeof useHistory>,
    lawSearchKey: string,
}
interface RouteParams {
    lawSearchKey: string | undefined,
}

export const useLawtextAppPageState = (): LawtextAppPageStateStruct => {

    const { lawSearchKey } = useParams<RouteParams>();

    const [state, origSetState] = React.useState<BaseLawtextAppPageState>(getInitialState);

    const setState = React.useCallback(
        (newState: Partial<BaseLawtextAppPageState>) => {
            origSetState(prevState => ({ ...prevState, ...newState }));
        },
        [origSetState],
    );
    const history = useHistory();

    return {
        origState: state,
        origSetState,
        setState,
        history,
        lawSearchKey: lawSearchKey ?? "",
    };
};
