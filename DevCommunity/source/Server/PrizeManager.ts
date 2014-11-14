import fs = require('fs');
///ts:import=UserSettingsRepository
import UserSettingsRepository = require('./UserSettingsRepository'); ///ts:import:generated
///ts:import=PrizeTransport
import PrizeTransport = require('../Common/PrizeTransport'); ///ts:import:generated

interface Winner {
    Email: string;
    PrizeId: string;
}

interface MeetingWinners {
    Date: Date;
    Winners: Array<Winner>;
}

interface Entry {
    Email: string;
    PrizeId: Array<string>;
}

interface Registration {
    Open: boolean;
    Entries: Array<Entry>;
    PastWinners: Array<string>;
}


class PrizeManager {
    constructor(private userRepo: UserSettingsRepository) {
        this.load();
    }

    public register(email: string, prizes: Array<string>, callback: (success: boolean, msg: string) => void): void {
        if (!this.Registration.Open) {
            callback(false, "Registration is currently closed");
        }
        else if (this.Registration.PastWinners.indexOf(email) != -1) {
            callback(false, "You are not eligble to win since you already won something recently.");
        }
        else {
            this.userRepo.getUserSettings(email, (success, settings) => {
                if (success) {
                    if (prizes.length > 0) {
                        this.removeEntryIfExists(email);
                        this.Registration.Entries.push({ Email: email, PrizeId: prizes });
                        this.save();
                        callback(true, "Success");
                    }
                    else {
                        callback(false, "You must select at least one prize to register");
                    }
                }
                else {
                    callback(false, "You must be registered on the website to be eligible to win prizes.");
                }
            });
        }
    }

    public pickWinner(prize: string): PrizeTransport.WinnerResponse {
        var eligble: Array<string> = [];
        for (var i = 0; i < this.Registration.Entries.length; ++i) {
            if (this.Registration.Entries[i].PrizeId.indexOf(prize) != -1) {
                eligble.push(this.Registration.Entries[i].Email);
            }
        }
        var index = Math.floor((Math.random() * (eligble.length)));
        return { Winner: eligble[index], Prize: prize };
    }

    public saveWinner(email: string, prize: string): void {
        this.Registration.PastWinners.push(email);
        this.removeEntryIfExists(email);
        this.save();
    }

    public openRegistration(): void {
        this.Registration.Entries = [];
        this.Registration.Open = true;
        this.save();
    }

    public closeRegistration(): void {
        this.Registration.Open = false;
        this.Registration.PastWinners = [];
        this.save();
    }

    public isRegistrationOpen(): boolean {
        return this.Registration.Open;
    }

    public getEntries(): Array<PrizeTransport.Entry> {
        var entries: Array<PrizeTransport.Entry> = [];
        this.Registration.Entries.forEach((entry, i) => {
            entries.push({ Email: entry.Email, PrizeId: entry.PrizeId.join() });
        });
        return entries;
    }

    public getPastWinners(): Array<string> {
        return this.Registration.PastWinners;
    }

    private removeEntryIfExists(email: string) {
        for (var i = 0; i < this.Registration.Entries.length; ++i) {
            if (this.Registration.Entries[i].Email == email) {
                this.Registration.Entries.splice(i, 1);
                break;
            }
        }
    }

    private load(): void {
        var path: string = this.getJsonPath();
        if (fs.existsSync(path)) {
            var input: any = fs.readFileSync(path);
            this.Registration = JSON.parse(input);
        }
        else {
            this.Registration = {
                Open: false, Entries: [], PastWinners: []
            };
            this.save();
        }
    }

    private save(): void {
        fs.writeFileSync(this.getJsonPath(), JSON.stringify(this.Registration));
    }

    private getJsonPath(): string {
        return "Data/PrizeRegistration.json";
    }

    private Registration: Registration;
}

export = PrizeManager;