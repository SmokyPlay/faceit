import agent from 'superagent';

export default class BrawlStars {
    public readonly URI: string = "https://api.brawlstars.com/v1"
    public token: string

    constructor(token: string) {
        this.token = token;
    }

    playerByTag(tag: string): Promise<any> {
        return new Promise((resolve, reject) => {
            agent
                .get(this.URI + `/players/${encodeURIComponent(tag)}`)
                .set("Authorization", `Bearer ${this.token}`)
                .then(res => {
                    resolve(res.body);
                })
                .catch(err => reject(err))
        })
    }

    battleLog(tag: string): Promise<any> {
        return new Promise((resolve, reject) => {
            agent
                .get(this.URI + `/players/${encodeURIComponent(tag)}/battlelog`)
                .set("Authorization", `Bearer ${this.token}`)
                .then(res => {
                    resolve(res.body);
                })
                .catch(err => reject(err))
        })
    }

    events(): Promise<any> {
        return new Promise((resolve, reject) => {
            agent
                .get(this.URI + `/events/rotation`)
                .set("Authorization", `Bearer ${this.token}`)
                .then(res => {
                    resolve(res.body);
                })
                .catch(err => reject(err))
        })
    }
}