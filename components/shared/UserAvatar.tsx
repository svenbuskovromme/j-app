import { api, userRow } from "jungle-shared";
import React, { createRef, FC, FunctionComponent, RefObject, useCallback, useRef, useState } from "react";
import { View, ActivityIndicator, Image, PixelRatio } from "react-native";
import { getSource } from "utils";
import { useAppSelector } from "redux/hooks";
import { useEffect } from "react";
import { store } from "redux/store";
import Svg, { Circle, Path } from "react-native-svg";
import CenteredLoader from "./CenteredLoader";

type UserMarkerProps = {
    user?: userRow | null,
    size?: number,
    round?: boolean,
    border?: string,
    borderWidth?: number,
    onMap?: boolean
}

const UserPlaceholder: FC<{color: string}> = ({color}) => <Svg viewBox="0 0 27 27" fill="none">
        <Circle cx="13.4061" cy="10.2162" r="2.51351" fill={color}/>
        <Circle cx="13.5" cy="13.5" r="12.5" stroke={color} strokeWidth="2"/>
        <Circle cx="13.5" cy="13.5" r="12.5" stroke={color} strokeWidth="2"/>
        <Path d="M22.6219 21.7839C19.8663 18.5728 16.7312 16.7568 13.4057 16.7568C10.0801 16.7568 6.94504 18.5728 4.18945 21.7839" stroke={color} strokeWidth="2"/>
    </Svg>;


export const UserAvatar: FunctionComponent<UserMarkerProps> = ({border = '#030303', borderWidth = 1,round = true,size = 40, onMap = false}) => {
    const user = useAppSelector(state => state.user.user);
    const ts = useAppSelector(state => state.user.photoTS);
    const getGoogleSizedSource = useCallback((url: string) => {
        const dpr = PixelRatio.get();
        const w = Math.round(size*dpr);

        if(url.endsWith('-c')){
            let index = url.indexOf('-c');
            let base = url;
            
            for(let i = index; i > 0; i--){
                if(url[i] === '='){
                    base = url.slice(0, i + 1);
                }
            }

            return `${base}s${w}-c`;
        }
        else if(url.includes('photo.jpg')){
            
            const base = url.slice(0, url.lastIndexOf('.jpg'));

            return `${base}?sz=${w}`;
        }

        return url;
    }, [size]);
    const _getSource = useCallback(() => { 
        const src = user ? (user.imageUrl ? getGoogleSizedSource(user.imageUrl) : getSource(user.id, 'user')+ `?v=${ts}`) : '';
        
        return src
    }, [user, ts, getGoogleSizedSource]);
    
    const [loading, setLoading] = useState<boolean>(false);
    const [imageUrl, setImageUrl] = useState<string>(_getSource());
    const imageRef = useRef<Image>() as RefObject<Image>;
    
    useEffect(() => {
        setImageUrl(_getSource()); 
    }, [_getSource]);
    
    const viewRef = useRef<View>() as RefObject<View>;

    return <View 
        ref={viewRef}
        style={{borderRadius: (round) ? size/2 : 0, height: size, width: size, borderWidth: border ? borderWidth : 0, backgroundColor: '#030303', borderColor: border, overflow: 'hidden', alignItems: 'center', justifyContent: 'center'}}
        >
            <View style={{position: 'absolute', borderRadius: size, width: size * 1, height: size * 1, justifyContent: 'center', alignItems: 'center'}}><UserPlaceholder color={border} /></View>
            { loading && <ActivityIndicator style={{backgroundColor: 'black', width: '100%', height: '100%', position: 'absolute'}} color='white' /> }
            {
                (user !== null && imageUrl) &&
                <Image ref={imageRef} style={{width: '100%', height: '100%'}} onLoadEnd={() => {setLoading(false);}} onError={()=> {setLoading(false); }} onLoadStart={() => {setLoading(true);}} onLoad={() => {setLoading(false)}} source={{ cache: 'reload', uri: imageUrl, headers: api.getHeaders()}} />
            }
    </View>;
}

// class UserAvatar extends React.PureComponent<UserMarkerProps, UserMarkerState>{
// constructor(props: UserMarkerProps){
//     super(props);

//     this.state ={
//         loading: false,
//         border: this.props.border ?? true,
//         round: this.props.round ?? true
//     }
// }

// private viewRef = createRef<View>() as RefObject<View>;

// public render(){
//     const {user, size = 56} = this.props;

//     return <View 
//         ref={this.viewRef}
//         style={{borderRadius: this.state.round ? size/2 : 0, height: size, width: size, borderWidth: this.state.border ? 1 : 0, borderColor: '#FCFAEE', overflow: 'hidden', backgroundColor: '#171617'}}
//         >
//             { this.state.loading && <ActivityIndicator style={{backgroundColor: 'black', width: '100%', height: '100%', position: 'absolute'}} color='white' /> }
//             { <Image style={{width: '100%', height: '100%'}} onLoadStart={() => this.setState({loading: true})} onLoadEnd={() => {this.setState({loading: false})}} source={{ cache: 'reload', uri: getSource(user.id, 'user'), headers: api.getHeaders()}} />}
//     </View>;
// }
// }

export default UserAvatar;