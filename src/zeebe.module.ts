import { Camunda8 } from '@camunda8/sdk';
import { Module, OnModuleDestroy, DynamicModule, Provider, Logger } from '@nestjs/common';
import { Configuration } from './configuration.interface';
import ZeebeService from './zeebe.service';

@Module({})
export class ZeebeModule implements OnModuleDestroy {
    public static forRoot(options: Configuration): DynamicModule {
        const optionsProviders: Provider[] = [];
        optionsProviders.push(this.createOptionsProvider(options));

        const connectionProviders: Provider[] = [];
        connectionProviders.push(this.createConnectionProvider());

        return {
            module: ZeebeModule,
            providers: [...optionsProviders, ...connectionProviders],
            exports: connectionProviders
        };
    }

    private static createOptionsProvider(options: Configuration): Provider {
        return {
            provide: 'ZEEBE_OPTIONS_PROVIDER',
            useValue: options
        };
    }

    private static createConnectionProvider(): Provider {
        return {
            provide: ZeebeService,
            useFactory: async (options: Configuration) => {
                const c8 = new Camunda8(options);
                const zeebe = c8.getZeebeGrpcApiClient();

                return zeebe;
            },
            inject: ['ZEEBE_OPTIONS_PROVIDER']
        };
    }

    onModuleDestroy() {
        Logger.error('Zeebe Module destroyed');
    }
}
