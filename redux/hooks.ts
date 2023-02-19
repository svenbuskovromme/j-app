import { skipToken } from '@reduxjs/toolkit/dist/query';
import { locationNodeGraph, locationNodesFilter } from 'jungle-shared';
import { useState, useEffect, useRef } from 'react';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { useGetLocationNodeByQuery, useGetLocationNodesQuery } from './api';
import { setAvailableNodes, setSelectedLocationNode } from './locationNodes';
import { RootState, AppDispatch } from './store'

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useLocationNodeId = () => {
    const filter = useAppSelector(state => state.locationNodes.filter);
    const nodesData = useGetLocationNodesQuery(filter ? {filter} : skipToken);
    const [id, setId] = useState<number>();
    const [ids, setIds] = useState<Set<number>>(new Set());
    const def = useAppSelector(state => state.locationNodes.defaultLocationNode);
    const dispatch = useAppDispatch();
    const selected = useAppSelector(state => state.locationNodes.selectedLocationNode);
    const availableNodes = useAppSelector(state => state.locationNodes.availableNodes);

    useEffect(() => {
        if(nodesData.data)
            dispatch(setAvailableNodes(nodesData.data));
    }, [nodesData.data]);

    useEffect(() => {
        setIds(new Set(availableNodes.map(n => n.locationNode.id)));
    }, [availableNodes]);

    // useEffect(() => {}, [nodesData.startedTimeStamp]);

    // useEffect(() => {console.log('request done', (nodesData.fulfilledTimeStamp ?? 0) - (nodesData.startedTimeStamp ?? 0))}, [nodesData.fulfilledTimeStamp]);

    useEffect(() => {
        // console.log('default id', def);
    }, [def]);

    useEffect(() => {
        if((!selected && def && ids.size) || (ids.size && selected && !ids.has(selected))){
            const newId = def && ids.has(def) ? def : ids.values().next().value;
            
            dispatch(setSelectedLocationNode(newId));
        }
    }, [ids, def, selected]);

    useEffect(() => {
        const id = !nodesData.isFetching && selected && ids.has(selected) ? selected : undefined;
        
        // console.log('setting id', selected, ids, nodesData.isFetching, 'new id', id);
        setId(id);
    }, [selected, ids, nodesData.isFetching]);

    const tsRef = useRef<number>(0);
    useEffect(() => {
        const ts = Date.now();
        // console.log((tsRef.current || ts) - ts);
        tsRef.current = ts;


    }, [id]);

    return id;
}

export const useLocationNode = () => {
    const locationNodeId = useLocationNodeId();
    const available = useAppSelector(state => state.locationNodes.availableNodes);
    const [locationNode, setLocationNode] = useState<locationNodeGraph>();
    useEffect(() => {
        setLocationNode(available.find(ln => ln.locationNode.id === locationNodeId));
    }, [locationNodeId, available]);
    
    return locationNode;
}

export const useLocationNodeData = (availableNodes: locationNodeGraph[]) => {
    const [id, setId] = useState<number>();
    const [ids, setIds] = useState<Set<number>>(new Set());
    const def = useAppSelector(state => state.locationNodes.defaultLocationNode);
    const dispatch = useAppDispatch();
    const selected = useAppSelector(state => state.locationNodes.selectedLocationNode);
    const locationNodeData = useGetLocationNodeByQuery(id ? {id} : skipToken);

    useEffect(() => {
        setIds(new Set(availableNodes.map(n => n.locationNode.id)));
    }, [availableNodes]);

    useEffect(() => {
        if(selected && !ids.has(selected)){
            const newId = def && ids.has(def) ? def : ids.values().next().value;
            
            dispatch(setSelectedLocationNode(newId));
        }
    }, [ids, def, selected]);

    useEffect(() => {
        const id = selected && ids.has(selected) ? selected : undefined;

        setId(id);
    }, [selected]);

    return locationNodeData;
}