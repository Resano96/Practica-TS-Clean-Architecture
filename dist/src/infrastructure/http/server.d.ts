import { FastifyInstance } from 'fastify';
import { Container } from '../../composition/container';
export declare const buildServer: ({ container, }?: {
    container?: Container;
}) => FastifyInstance;
